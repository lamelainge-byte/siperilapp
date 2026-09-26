import Joi from 'joi';
import { throwIfInvalid } from '../../../../shared/utils/joi.js';
import type { CreateUserDto, UpdateUserDto } from '../../application/dto/UserDto.js';

const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+)*$/;
// la clave del admin debe mezclar letra y numero
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;

const createSchema = Joi.object({
  name: Joi.string().trim().min(3).pattern(namePattern).required().messages({
    'string.base': 'El nombre debe ser un texto',
    'string.empty': 'El nombre es obligatorio',
    'string.min': 'El nombre debe tener mínimo 3 caracteres',
    'string.pattern.base': 'El nombre solo admite letras y espacios',
    'any.required': 'El nombre es obligatorio',
  }),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'El correo electrónico no es válido',
    'any.required': 'El correo es obligatorio',
  }),
  password: Joi.string().min(6).pattern(passwordPattern).required().messages({
    'string.min': 'La contraseña debe tener mínimo 6 caracteres',
    'string.pattern.base': 'La contraseña debe incluir al menos una letra y un número',
    'any.required': 'La contraseña es obligatoria',
  }),
  company: Joi.string().trim().min(2).required().messages({
    'string.min': 'La empresa es obligatoria',
    'any.required': 'La empresa es obligatoria',
  }),
  role: Joi.string().valid('worker', 'admin').default('worker'),
  status: Joi.number().valid(0, 1).default(1),
}).unknown(false);

const updateSchema = Joi.object({
  name: Joi.string().trim().min(3).pattern(namePattern),
  email: Joi.string().trim().email({ tlds: { allow: false } }),
  password: Joi.string().min(6).pattern(passwordPattern),
  company: Joi.string().trim().min(2),
  role: Joi.string().valid('worker', 'admin'),
  status: Joi.number().valid(0, 1),
})
  .min(1)
  .unknown(false);

export function loadUserData(data: unknown): CreateUserDto {
  const { error, value } = createSchema.validate(data, { abortEarly: false });
  throwIfInvalid(error);
  return value as CreateUserDto;
}

export function loadUpdateUserData(data: unknown): UpdateUserDto {
  const { error, value } = updateSchema.validate(data, { abortEarly: false });
  throwIfInvalid(error);
  return value as UpdateUserDto;
}
