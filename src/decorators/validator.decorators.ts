import type { ValidationOptions } from 'class-validator';
import { ValidateIf } from 'class-validator';

export function IsUndefinable(options?: ValidationOptions): PropertyDecorator {
  return ValidateIf((_obj, value) => value !== undefined, options);
}

export function IsNullable(options?: ValidationOptions): PropertyDecorator {
  return ValidateIf((_obj, value) => value !== null, options);
}
