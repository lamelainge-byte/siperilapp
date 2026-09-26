import { AppError } from '../../../../shared/utils/errors.js';
import { toAuthUser } from '../../../users/domain/entities/User.js';
import type { TokenPort } from '../../domain/ports/TokenPort.js';

export class RefreshSession {
  constructor(private readonly tokens: TokenPort) {}

  async execute(refreshToken: string) {
    // invalida el refresh usado y entrega access y refresh nuevos
    const result = await this.tokens.rotateRefresh(refreshToken);
    if (!result) throw new AppError(401, 'Refresh token inválido o revocado');
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: toAuthUser(result.user),
    };
  }
}
