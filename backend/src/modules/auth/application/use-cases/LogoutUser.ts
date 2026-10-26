import type { TokenPort } from '../../domain/ports/TokenPort.js';

export class LogoutUser {
  constructor(private readonly tokens: TokenPort) {}

  async execute(refreshToken: string | undefined, userId: string): Promise<void> {
    // revoca ese refresh o, si no llega, todas las sesiones del usuario
    if (refreshToken) await this.tokens.revokeRefresh(refreshToken);
    else await this.tokens.revokeAll(userId);
  }
}
