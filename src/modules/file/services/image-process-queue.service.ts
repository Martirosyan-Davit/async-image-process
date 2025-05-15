import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue, QueueEvents, Worker } from 'bullmq';
import IORedis from 'ioredis';

import { IImageProcessJob, IImageProcessResult } from '../../../interfaces';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { ImageProcessService } from './image-process-service';

@Injectable()
export class ImageProcessQueueService implements OnModuleInit {
  private imageQueue!: Queue<IImageProcessJob, IImageProcessResult>;

  private queueEvents!: QueueEvents;

  private workers: Array<Worker<IImageProcessJob, IImageProcessResult>> = [];

  private readonly logger = new Logger(ImageProcessQueueService.name);

  private readonly connection: IORedis;

  private readonly queueName = 'image-processing';

  private readonly workersCount = 2; // Number of concurrent workers

  private readonly jobCallbacks = new Map<
    string,
    (result: string | null) => void
  >();

  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly imageProcessService: ImageProcessService,
  ) {
    // Create Redis connection
    this.connection = new IORedis({
      host: this.apiConfigService.redisConfig.host,
      port: this.apiConfigService.redisConfig.port,
      maxRetriesPerRequest: null, // Required by BullMQ
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async onModuleInit() {
    // Initialize the queue
    this.imageQueue = new Queue<IImageProcessJob, IImageProcessResult>(
      this.queueName,
      {
        connection: this.connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: 100,
        },
      },
    );

    // Initialize queue events listener
    this.queueEvents = new QueueEvents(this.queueName, {
      connection: this.connection,
    });

    // Listen for completed jobs
    // eslint-disable-next-line @typescript-eslint/require-await
    this.queueEvents.on(
      'completed',
      async ({ jobId: _queueJobId, returnvalue }) => {
        const result = JSON.parse(returnvalue) as IImageProcessResult;
        const callback = this.jobCallbacks.get(result.jobId);

        if (callback) {
          callback(result.imagePath);
          this.jobCallbacks.delete(result.jobId);
        }
      },
    );

    // Listen for failed jobs
    this.queueEvents.on('failed', async ({ jobId, failedReason }) => {
      this.logger.error(`Job ${jobId} failed: ${failedReason}`);
      const job = await this.imageQueue.getJob(jobId);

      if (job) {
        const data = job.data;
        const callback = this.jobCallbacks.get(data.jobId);

        if (callback) {
          callback(null);
          this.jobCallbacks.delete(data.jobId);
        }
      }
    });

    // Create multiple workers for parallel processing
    for (let i = 0; i < this.workersCount; i++) {
      const worker = new Worker<IImageProcessJob, IImageProcessResult>(
        this.queueName,
        async (job: Job<IImageProcessJob>) => {
          this.logger.log(
            `Worker ${i + 1} processing job ${job.id} with prompt: ${job.data.prompt}`,
          );

          try {
            // Process the image
            const imagePath = await this.imageProcessService.process(
              job.data.prompt,
            );

            return {
              imagePath,
              jobId: job.data.jobId,
            };
          } catch (error) {
            this.logger.error(
              `Error processing image in worker ${i + 1}`,
              error,
            );

            throw error;
          }
        },
        { connection: this.connection },
      );

      worker.on('error', (err) => {
        this.logger.error(`Worker ${i + 1} error: ${err.message}`, err.stack);
      });

      this.workers.push(worker);
      this.logger.log(`Worker ${i + 1} initialized`);
    }

    this.logger.log(
      `Initialized ${this.workersCount} image processing workers`,
    );
  }

  /**
   * Process an image asynchronously
   * @param prompt The text prompt for image generation
   * @returns A promise that resolves to the image path or null if processing failed
   */
  async processImageAsync(prompt: string): Promise<string | null> {
    const jobId = Math.random().toString(36).slice(2, 15);

    // Create a promise that resolves when the job is done
    const resultPromise = new Promise<string | null>((resolve) => {
      // Store the callback to be called when the job completes
      this.jobCallbacks.set(jobId, resolve);
    });

    // Add the job to the queue
    await this.imageQueue.add('process-image', { prompt, jobId });

    this.logger.log(
      `Added image processing job ${jobId} to queue with prompt: ${prompt}`,
    );

    return resultPromise;
  }

  async onModuleDestroy() {
    // Close all workers and the queue when the module is destroyed
    const closePromises = this.workers.map((worker) => worker.close());
    await Promise.all(closePromises);

    await this.imageQueue.close();
    await this.queueEvents.close();
    this.connection.disconnect();
  }
}
