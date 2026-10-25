// contrato de usuarios, el caso de uso pide estos metodos, useradapter los cumple con typeorm
import type { Role } from '../../../../shared/utils/types.js';
import type { User } from '../entities/User.js';

export type NewUser = {
  name: string;
  email: string;
  passwordHash: string;
  company: string;
  employeeNumber: string | null;
  role: Role;
  status: number;
};

export type UserUpdates = {
  name?: string;
  email?: string;
  passwordHash?: string;
  company?: string;
  employeeNumber?: string | null;
  role?: Role;
  status?: number;
};

export interface UserPort {
  createUser(user: NewUser): Promise<string>;
  updateUser(id: string, user: UserUpdates): Promise<boolean>;
  deleteUser(id: string): Promise<boolean>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByEmployeeNumber(employeeNumber: string): Promise<User | null>;
  getAllUsers(company?: string): Promise<User[]>;
}
