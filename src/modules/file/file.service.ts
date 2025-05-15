import { Injectable } from '@nestjs/common';

import { ImageProcessQueueService } from './services/image-process-queue.service';
import { ImageProcessService } from './services/image-process-service';

@Injectable()
export class FileService {
  constructor(
    private imageProcessService: ImageProcessService,
    private imageProcessQueueService: ImageProcessQueueService,
  ) {}

  // Process image synchronously (blocking)
  processImageByPrompt(prompt: string) {
    return this.imageProcessService.process(prompt);
  }

  // Process image asynchronously (non-blocking with parallel workers)
  processImageByPromptAsync(prompt: string) {
    return this.imageProcessQueueService.processImageAsync(prompt);
  }
}
