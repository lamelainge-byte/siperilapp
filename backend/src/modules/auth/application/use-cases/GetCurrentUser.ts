import { AppError } from '../../../../shared/utils/errors.js';
import { toAuthUser, type AuthUser } from '../../../users/domain/entities/User.js';
import type { UserPort } from '../../../users/domain/ports/UserPort.js';

export class GetCurrentUser {
  constructor(private readonly users: UserPort) {}

  async execute(userId: string): Promise<AuthUser> {
    const user = await this.users.getUserById(userId);
    // una cuenta desactivada no puede consultar su perfil
    if (!user || user.status === 0) throw new AppError(404, 'Usuario no encontrado');
    return toAuthUser(user);
  }
}
