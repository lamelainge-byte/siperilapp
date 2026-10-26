import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import type { UserPort } from '../../domain/ports/UserPort.js';

export class DeleteUser {
  constructor(private readonly port: UserPort) {}

  async execute(id: string, actor: Actor): Promise<void> {
    if (actor.role !== 'admin') {
      throw new AppError(403, 'Solo un administrador puede gestionar usuarios');
    }
    // un admin no puede desactivar su propia cuenta
    if (actor.id === id) {
      throw new AppError(409, 'No puedes eliminar tu propia cuenta');
    }
    const user = await this.port.getUserById(id);
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }
    const ok = await this.port.deleteUser(id);
    if (!ok) {
      throw new AppError(404, 'Usuario no encontrado');
    }
  }
}
