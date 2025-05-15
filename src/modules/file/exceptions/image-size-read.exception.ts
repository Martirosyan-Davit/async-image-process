import { BadRequestException } from '@nestjs/common';

export class ImageSizeReadException extends BadRequestException {
  constructor() {
    super('error.imageSizeRead');
  }
}
