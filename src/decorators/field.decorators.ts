/* eslint-disable unicorn/no-null */
import { applyDecorators } from '@nestjs/common';
import type { ApiPropertyOptions } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsString,
  MaxLength,
  MinLength,
  NotEquals,
} from 'class-validator';

import { ToLowerCase, ToUpperCase, Trim } from './transform.decorators';
import { IsNullable } from './validator.decorators';

interface IFieldOptions {
  each?: boolean;
  swagger?: boolean;
  nullable?: boolean;
  groups?: string[];
}

interface IStringFieldOptions extends IFieldOptions {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  trimNewLines?: boolean;
}

export function StringField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    Expose({ groups: options.groups, name: options.name }),
    Type(() => String),
    IsString({ each: options.each }),
    MinLength(options.minLength ?? 1, {
      each: options.each,
      message: `The length of the string must be at least ${options.minLength ?? 1} characters.`,
    }),
    Trim(options.trimNewLines ?? true),
  ];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({ type: String, ...options, isArray: options.each }),
    );
  }

  if (options.maxLength) {
    decorators.push(
      MaxLength(options.maxLength, {
        each: options.each,
        message: `The length of the string must be at most ${options.maxLength} characters.`,
      }),
    );
  }

  if (options.toLowerCase) {
    decorators.push(ToLowerCase());
  }

  if (options.toUpperCase) {
    decorators.push(ToUpperCase());
  }

  if (options.each) {
    decorators.push(ArrayMinSize(options.minItems ?? 1));
  }

  if (options.each && options.maxItems) {
    decorators.push(ArrayMaxSize(options.maxItems));
  }

  return applyDecorators(...decorators);
}
