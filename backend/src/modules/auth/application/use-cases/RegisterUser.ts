import { AppError } from '../../../../shared/utils/errors.js';
import type { PasswordHasher } from '../../../users/domain/ports/HasherPort.js';
import type { UserPort } from '../../../users/domain/ports/UserPort.js';
import type { RegisterDto } from '../dto/AuthDto.js';

export class RegisterUser {
  constructor(
    private readonly users: UserPort,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: RegisterDto) {
    const existing = await this.users.getUserByEmail(input.email.toLowerCase());
    if (existing) throw new AppError(409, 'Ese correo ya está registrado');
    const id = await this.users.createUser({
      name: input.name,
      email: input.email.toLowerCase(),
      company: input.company,
      passwordHash: await this.hasher.hash(input.password),
      role: 'worker', // el registro publico siempre crea un trabajador activo
      status: 1,
    });
    const user = await this.users.getUserById(id);
    if (!user) throw new AppError(500, 'No se pudo leer el usuario creado');
    return { id: user.id, email: user.email, role: user.role };
  }
}
