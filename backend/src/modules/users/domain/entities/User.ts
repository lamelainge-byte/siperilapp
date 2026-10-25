// objeto de negocio del usuario, publicuser es lo que sale al cliente, sin passwordhash
import type { Role } from '../../../../shared/utils/types.js';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  company: string;
  employeeNumber: string | null;
  role: Role;
  status: number;
  createdAt: Date;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export type AuthUser = Pick<User, 'id' | 'name' | 'email' | 'company' | 'employeeNumber' | 'role' | 'status'>;

// quita el hash para que la api nunca lo envie al cliente
export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _hidden, ...rest } = user;
  return rest;
}

// datos minimos que viajan en la respuesta de login
export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    company: user.company,
    employeeNumber: user.employeeNumber,
    role: user.role,
    status: user.status,
  };
}
