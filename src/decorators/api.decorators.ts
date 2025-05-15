import { applyDecorators, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export function ApiController(prefix: string): ClassDecorator {
  return applyDecorators(Controller(prefix), ApiTags(prefix));
}
