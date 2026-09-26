import Joi from 'joi';
import { AppError } from './errors.js';

// convierte la validacion fallida de joi en un error 400
export function throwIfInvalid(error: Joi.ValidationError | undefined) {
  if (error) {
    throw new AppError(400, error.details.map((detail) => detail.message).join('; '));
  }
}
