import type { Role } from '../../../../shared/utils/types.js';

export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  company: string;
  role?: Role;
  status?: number;
};

export type UpdateUserDto = Partial<{
  name: string;
  email: string;
  password: string;
  company: string;
  role: Role;
  status: number;
}>;
