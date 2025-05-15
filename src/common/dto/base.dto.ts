/* eslint-disable @typescript-eslint/no-explicit-any */
import { flatten, UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export abstract class BaseDto {
  static create<T extends BaseDto>(
    this: new (...args: any[]) => T,
    data: T,
  ): T {
    const convertedObject = plainToInstance<T, any>(this, data);

    // FIXME: add check for local and dev env and disable this for production
    const errors = validateSync(convertedObject);

    if (errors.length > 0) {
      const mappedErrors = flatten(
        errors.map((item) => Object.values(item.constraints!)),
      );

      throw new UnprocessableEntityException(mappedErrors);
    }

    return convertedObject;
  }
}
