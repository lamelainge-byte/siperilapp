import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import type { PasswordHasher } from '../../domain/ports/HasherPort.js';
import { toPublicUser, type PublicUser } from '../../domain/entities/User.js';
import type { UserPort } from '../../domain/ports/UserPort.js';
import type { CreateUserDto } from '../dto/UserDto.js';

export class CreateUser {
  constructor(
    private readonly port: UserPort,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(actor: Actor, input: CreateUserDto): Promise<PublicUser> {
    // este alta es del panel, solo un admin puede crear cuentas
    if (actor.role !== 'admin') {
      throw new AppError(403, 'Solo un administrador puede gestionar usuarios');
    }
    const exists = await this.port.getUserByEmail(input.email.toLowerCase());
    if (exists) {
      throw new AppError(409, 'Ese correo ya está registrado');
    }
    const employeeNumber = input.employeeNumber?.trim() || null;
    if (employeeNumber) {
      const sameNumber = await this.port.getUserByEmployeeNumber(employeeNumber);
      if (sameNumber) {
        throw new AppError(409, 'Ese número de trabajador ya está registrado');
      }
    }
    const id = await this.port.createUser({
      name: input.name,
      email: input.email.toLowerCase(),
      company: input.company,
      employeeNumber,
      passwordHash: await this.hasher.hash(input.password),
      role: input.role ?? 'worker', // si no indican rol queda trabajador activo
      status: input.status ?? 1,
    });
    const created = await this.port.getUserById(id);
    if (!created) {
      throw new AppError(500, 'No se pudo leer el usuario creado');
    }
    // la respuesta no incluye el hash de la clave
    return toPublicUser(created);
  }
}
