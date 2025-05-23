import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

// import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  exports: [FileService],
  providers: [FileService],
})
// Module is used for testing purposes
export class FileModule {}
