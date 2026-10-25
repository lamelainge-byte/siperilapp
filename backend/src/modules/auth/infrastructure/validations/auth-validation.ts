import Joi from 'joi';
import { throwIfInvalid } from '../../../../shared/utils/joi.js';
import type { LoginDto, RegisterDto } from '../../application/dto/AuthDto.js';

// joi valida el cuerpo antes de entrar al caso de uso
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export function loadRegisterData(data: unknown): RegisterDto {
  const { error, value } = Joi.object({
    name: Joi.string().trim().min(2).required(),
    email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
    company: Joi.string().trim().min(2).required(),
    employeeNumber: Joi.string().trim().min(1).max(30).pattern(/^[A-Za-z0-9-]+$/).required().messages({
      'string.pattern.base': 'El número de trabajador solo admite letras, números y guion',
      'any.required': 'El número de trabajador es obligatorio',
    }),
    password: Joi.string().min(6).pattern(passwordPattern).required().messages({
      'string.pattern.base': 'La contraseña debe incluir al menos una letra y un número',
    }),
  })
    .unknown(false)
    .validate(data, { abortEarly: false });
  throwIfInvalid(error);
  return value as RegisterDto;
}

export function loadLoginData(data: unknown): LoginDto {
  const { error, value } = Joi.object({
    email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(6).required(),
  })
    .unknown(false)
    .validate(data, { abortEarly: false });
  throwIfInvalid(error);
  return value as LoginDto;
}

export function loadRefreshData(data: unknown): { refreshToken: string } {
  const { error, value } = Joi.object({
    refreshToken: Joi.string().min(10).required(),
  })
    .unknown(false)
    .validate(data, { abortEarly: false });
  throwIfInvalid(error);
  return value as { refreshToken: string };
}
