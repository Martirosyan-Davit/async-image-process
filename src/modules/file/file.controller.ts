import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { ImagePayloadDto } from '../../common/dto/image-payload.dto';
import { ApiController } from '../../decorators/api.decorators';
import { CreateImageDto } from './dto/create-image.dto';
import { FileService } from './file.service';

@ApiController('files')
export class FileController {
  constructor(private fileService: FileService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    type: ImagePayloadDto,
    description: 'Upload image synchronously.',
  })
  process(@Body() createImageDto: CreateImageDto) {
    return this.fileService.processImageByPrompt(createImageDto.prompt);
  }

  @Post('async')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponse({
    type: ImagePayloadDto,
    description: 'Process image asynchronously with parallel workers.',
  })
  processAsync(@Body() createImageDto: CreateImageDto) {
    return this.fileService.processImageByPromptAsync(createImageDto.prompt);
  }
}
