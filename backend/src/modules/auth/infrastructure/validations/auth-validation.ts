import Joi from 'joi';
import { throwIfInvalid } from '../../../../shared/utils/joi.js';

// joi valida el cuerpo antes de entrar al caso de uso
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export function loadRegisterData(data: unknown) {
  const { error, value } = Joi.object({
    name: Joi.string().trim().min(2).required(),
    email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
    company: Joi.string().trim().min(2).required(),
    password: Joi.string().min(6).pattern(passwordPattern).required().messages({
      'string.pattern.base': 'La contraseña debe incluir al menos una letra y un número',
    }),
  })
    .unknown(false)
    .validate(data, { abortEarly: false });
  throwIfInvalid(error);
  return value as { name: string; email: string; company: string; password: string };
}

export function loadLoginData(data: unknown) {
  const { error, value } = Joi.object({
    email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(6).required(),
  })
    .unknown(false)
    .validate(data, { abortEarly: false });
  throwIfInvalid(error);
  return value as { email: string; password: string };
}

export function loadRefreshData(data: unknown) {
  const { error, value } = Joi.object({
    refreshToken: Joi.string().min(10).required(),
  })
    .unknown(false)
    .validate(data, { abortEarly: false });
  throwIfInvalid(error);
  return value as { refreshToken: string };
}
