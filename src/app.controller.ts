import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { ImagePayloadDto } from './../src/common/dto/image-payload.dto';
import { AppService } from './app.service';
import { CreateImageDto } from './modules/file/dto/create-image.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ImagePayloadDto,
    description: 'Process image with worker threads (non-blocking)',
  })
  process(@Body() createImageDto: CreateImageDto) {
    return this.appService.runWorker(createImageDto.prompt);
  }
}
