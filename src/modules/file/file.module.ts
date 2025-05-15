import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { FileController } from './file.controller';
import { FileService } from './file.service';
import { ImageProcessQueueService } from './services/image-process-queue.service';
import { ImageProcessService } from './services/image-process-service';
import { StoreImageService } from './services/store-image.service';

@Module({
  imports: [HttpModule],
  controllers: [FileController],
  exports: [FileService],
  providers: [
    FileService,
    StoreImageService,
    ImageProcessService,
    ImageProcessQueueService,
  ],
})
export class FileModule {}
