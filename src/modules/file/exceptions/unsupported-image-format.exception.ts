import { BadRequestException } from '@nestjs/common';

export class UnsupportedImageFormatException extends BadRequestException {
  constructor(format: string | undefined) {
    super(`error.unsupportedImageFormat: ${format || 'unknown'}`);
  }
}
