import { AppError } from '../../../../shared/utils/errors.js';
import type { PasswordHasher } from '../../../users/domain/ports/HasherPort.js';
import type { TokenPort } from '../../domain/ports/TokenPort.js';
import { toAuthUser } from '../../../users/domain/entities/User.js';
import type { UserPort } from '../../../users/domain/ports/UserPort.js';
import type { LoginDto } from '../dto/AuthDto.js';

export class LoginUser {
  constructor(
    private readonly users: UserPort,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenPort,
  ) {}

  async execute(input: LoginDto) {
    // el mismo mensaje si el correo no existe o la cuenta esta inactiva
    const user = await this.users.getUserByEmail(input.email.toLowerCase());
    if (!user || user.status === 0) {
      throw new AppError(401, 'Correo o contraseña incorrectos');
    }
    const ok = await this.hasher.compare(input.password, user.passwordHash);
    // bcrypt compara sin revelar si fallo el correo o la clave
    if (!ok) throw new AppError(401, 'Correo o contraseña incorrectos');
    // entrega access de corta duracion y un refresh que se guarda hasheado
    return {
      accessToken: this.tokens.signAccess({ id: user.id, role: user.role, email: user.email }),
      refreshToken: await this.tokens.issueRefresh(user.id),
      user: toAuthUser(user),
    };
  }
}
