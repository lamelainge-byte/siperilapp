import type { Role } from '../../../../shared/utils/types.js';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  company: string;
  role: Role;
  status: number;
  createdAt: Date;
}

export type PublicUser = Omit<User, 'passwordHash'>;

// quita el hash para que la api nunca lo envie al cliente
export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _hidden, ...rest } = user;
  return rest;
}

// datos minimos que viajan en la respuesta de login
export function toAuthUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    company: user.company,
    role: user.role,
    status: user.status,
  };
}
