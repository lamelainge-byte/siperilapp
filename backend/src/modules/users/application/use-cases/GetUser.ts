import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import { toPublicUser } from '../../domain/entities/User.js';
import type { UserPort } from '../../domain/ports/UserPort.js';

export class GetUser {
  constructor(private readonly port: UserPort) {}

  async execute(id: string, actor: Actor) {
    // el trabajador solo consulta su propio perfil
    if (actor.role !== 'admin' && actor.id !== id) {
      throw new AppError(403, 'No puedes ver este usuario');
    }
    const user = await this.port.getUserById(id);
    if (!user || user.status === 0) {
      throw new AppError(404, 'Usuario no encontrado');
    }
    return toPublicUser(user);
  }
}
