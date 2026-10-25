// forma del body de crear y editar un usuario, el controlador lo valida con joi antes del caso de uso
import type { Role } from '../../../../shared/utils/types.js';

export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  company: string;
  employeeNumber?: string | null;
  role?: Role;
  status?: number;
};

export type UpdateUserDto = Partial<{
  name: string;
  email: string;
  password: string;
  company: string;
  employeeNumber: string | null;
  role: Role;
  status: number;
}>;
