import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import path from 'path';

import { ImageProcessService } from './image-process-service';

@Injectable()
export class StoreImageService {
  private readonly imagesDir = path.join(process.cwd(), 'images');

  private readonly logger = new Logger(StoreImageService.name);

  constructor(private imageProcessService: ImageProcessService) {
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
    }
  }
}
