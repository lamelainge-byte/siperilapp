import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import type { UserPort } from '../../../users/domain/ports/UserPort.js';

// corta el flujo si quien llama no es administrador
export function assertAdmin(actor: Actor): void {
  if (actor.role !== 'admin') {
    throw new AppError(403, 'Solo un administrador puede gestionar sitios');
  }
}

// la empresa del trabajador sale de su fila en postgresql
export async function companyOf(users: UserPort, actor: Actor): Promise<string> {
  const user = await users.getUserById(actor.id);
  if (!user) throw new AppError(404, 'Usuario no encontrado');
  return user.company;
}
