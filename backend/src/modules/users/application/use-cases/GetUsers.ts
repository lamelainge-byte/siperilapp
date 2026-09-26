import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import { toPublicUser } from '../../domain/entities/User.js';
import type { UserPort } from '../../domain/ports/UserPort.js';

export class GetUsers {
  constructor(private readonly port: UserPort) {}

  async execute(actor: Actor, company?: string) {
    if (actor.role !== 'admin') {
      throw new AppError(403, 'Solo un administrador puede gestionar usuarios');
    }
    // lista activos y puede filtrar por empresa, sin devolver claves
    const users = await this.port.getAllUsers(company);
    return users.map(toPublicUser);
  }
}
