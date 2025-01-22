/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable import/no-extraneous-dependencies */
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationError as ValidationsError } from '../errors';

export class GlobalValidator {
  static async validateInput<T extends object>(
    cls: new () => T,
    plainObject: object,
  ): Promise<T> {
    const instance = plainToClass(cls, plainObject);
    const errors: ValidationError[] = await validate(instance);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints || {}))
        .flat();
      throw new ValidationsError(
        `Validation failed: ${errorMessages.join(', ')}`,
      );
    }

    return instance;
  }
}
