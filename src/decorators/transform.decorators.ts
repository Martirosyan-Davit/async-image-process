import { Transform } from 'class-transformer';
import type { Many } from 'lodash';
import { trim } from 'lodash';

/**
 * @description trim spaces from start and end, replace multiple spaces with one.
 * @example
 * @ApiProperty()
 * @IsString()
 * @Trim()
 * name: string;
 * @returns PropertyDecorator
 * @constructor
 */
export function Trim(trimNewLines: boolean): PropertyDecorator {
  return Transform((params): Many<string> => {
    const value = params.value as Many<string>;

    if (!value) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((v: string) => {
        const trimmedValue = trim(v);

        if (trimNewLines) {
          return trimmedValue.replaceAll(/\s\s+/g, ' ');
        }

        return trimmedValue;
      });
    }

    const trimmedValue = trim(value as string);

    if (trimNewLines) {
      return trimmedValue.replaceAll(/\s\s+/g, ' ');
    }

    return trimmedValue;
  });
}

export function ToLowerCase(): PropertyDecorator {
  return Transform(
    (params): Many<string> | undefined | null => {
      const value = params.value;

      if (!value) {
        return value;
      }

      if (Array.isArray(value)) {
        return value.map((v) => v.toLowerCase());
      }

      return value.toLowerCase();
    },
    {
      toClassOnly: true,
    },
  );
}

export function ToUpperCase(): PropertyDecorator {
  return Transform(
    (params): Many<string> | undefined | null => {
      const value = params.value;

      if (!value) {
        return value;
      }

      if (Array.isArray(value)) {
        return value.map((v) => v.toUpperCase());
      }

      return value.toUpperCase();
    },
    {
      toClassOnly: true,
    },
  );
}
