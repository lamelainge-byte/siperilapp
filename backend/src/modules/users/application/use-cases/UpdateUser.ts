import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import type { PasswordHasher } from '../../domain/ports/HasherPort.js';
import { toPublicUser } from '../../domain/entities/User.js';
import type { UserPort } from '../../domain/ports/UserPort.js';
import type { UpdateUserDto } from '../dto/UserDto.js';

export class UpdateUser {
  constructor(
    private readonly port: UserPort,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(id: string, actor: Actor, input: UpdateUserDto) {
    if (actor.role !== 'admin') {
      throw new AppError(403, 'Solo un administrador puede gestionar usuarios');
    }
    const user = await this.port.getUserById(id);
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }
    // si cambia el correo se revisa que no lo tenga otra cuenta
    if (input.email && input.email.toLowerCase() !== user.email) {
      const taken = await this.port.getUserByEmail(input.email.toLowerCase());
      if (taken && taken.id !== id) {
        throw new AppError(409, 'Ese correo ya está registrado');
      }
    }
    const ok = await this.port.updateUser(id, {
      ...(input.name ? { name: input.name } : {}),
      ...(input.email ? { email: input.email.toLowerCase() } : {}),
      ...(input.company ? { company: input.company } : {}),
      ...(input.role ? { role: input.role } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      // la clave nueva se hashea antes de guardarla
      ...(input.password ? { passwordHash: await this.hasher.hash(input.password) } : {}),
    });
    if (!ok) {
      throw new AppError(404, 'Usuario no encontrado o sin cambios');
    }
    const updated = await this.port.getUserById(id);
    if (!updated) {
      throw new AppError(404, 'Usuario no encontrado');
    }
    return toPublicUser(updated);
  }
}
