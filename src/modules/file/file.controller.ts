import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { ImagePayloadDto } from '../../common/dto/image-payload.dto';
import { ApiController } from '../../decorators/api.decorators';
import { CreateImageDto } from './dto/create-image.dto';
import { FileService } from './file.service';

@ApiController('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ImagePayloadDto,
    description: 'Process image with worker threads (non-blocking)',
  })
  async process(
    @Body() createImageDto: CreateImageDto,
  ): Promise<ImagePayloadDto> {
    const imagePath = await this.fileService.processImageByPrompt(
      createImageDto.prompt,
    );

    return { imagePath: imagePath || 'Processing failed' };
  }
}
