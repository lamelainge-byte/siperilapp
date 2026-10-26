// registro publico, siempre crea un worker activo, si el correo existe, responde 409
import type { Role } from '../../../../shared/utils/types.js';
import { AppError } from '../../../../shared/utils/errors.js';
import type { PasswordHasher } from '../../../users/domain/ports/HasherPort.js';
import type { UserPort } from '../../../users/domain/ports/UserPort.js';
import type { RegisterDto } from '../dto/AuthDto.js';
import type { AccessLogPort } from '../../domain/ports/AccessLogPort.js';

export class RegisterUser {
  constructor(
    private readonly users: UserPort,
    private readonly hasher: PasswordHasher,
    private readonly accessLogs: AccessLogPort,
  ) {}

  async execute(input: RegisterDto): Promise<{ id: string; email: string; role: Role }> {
    const existing = await this.users.getUserByEmail(input.email.toLowerCase());
    if (existing) throw new AppError(409, 'Ese correo ya está registrado');
    const employeeNumber = input.employeeNumber.trim();
    const sameNumber = await this.users.getUserByEmployeeNumber(employeeNumber);
    if (sameNumber) throw new AppError(409, 'Ese número de trabajador ya está registrado');
    const id = await this.users.createUser({
      name: input.name,
      email: input.email.toLowerCase(),
      company: input.company,
      employeeNumber,
      passwordHash: await this.hasher.hash(input.password),
      role: 'worker', // el registro publico siempre crea un trabajador activo
      status: 1,
    });
    const user = await this.users.getUserById(id);
    if (!user) throw new AppError(500, 'No se pudo leer el usuario creado');
    await this.accessLogs.record({
      userId: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      employeeNumber: user.employeeNumber,
      kind: 'register',
    });
    return { id: user.id, email: user.email, role: user.role };
  }
}
