// paquete del crud de usuarios, el controlador llama createuser, getuser, getusers, updateuser y deleteuser
import { CreateUser } from './use-cases/CreateUser.js';
import { DeleteUser } from './use-cases/DeleteUser.js';
import { GetUser } from './use-cases/GetUser.js';
import { GetUsers } from './use-cases/GetUsers.js';
import { UpdateUser } from './use-cases/UpdateUser.js';

export type UserUseCases = {
  createUser: CreateUser;
  getUser: GetUser;
  getUsers: GetUsers;
  updateUser: UpdateUser;
  deleteUser: DeleteUser;
};
