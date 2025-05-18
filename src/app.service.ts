import { Injectable, Logger } from '@nestjs/common';
import { isMainThread, Worker } from 'worker_threads';

import workerThreadFilePath from './modules/worker-threads/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  checkMainThread() {
    this.logger.debug(
      'Are we on the main thread here?',
      isMainThread ? 'Yes.' : 'No.',
    );
  }

  // do not run this from the worker thread or you will spawn an infinite number of threads in cascade
  runWorker(prompt: string): string {
    this.checkMainThread();
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const thisService = this;
    const worker = new Worker(workerThreadFilePath, {
      workerData: prompt,
    });
    worker.on('message', (path) => {
      thisService.logger.verbose('Image processed', path);
    });
    worker.on('error', (err) => {
      thisService.logger.error('Worker error', err);
    });
    worker.on('exit', (code) => {
      thisService.logger.debug('Worker exited with code', code);
    });

    return 'Processing the image... Check NestJS app console for the result.';
  }
}
