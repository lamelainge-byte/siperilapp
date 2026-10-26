import { createHash, randomBytes } from 'crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Actor } from '../../../../shared/utils/types.js';
import type { UserPort } from '../../../users/domain/ports/UserPort.js';
import type { User } from '../../../users/domain/entities/User.js';
import type { RefreshTokenPort } from '../../domain/ports/RefreshTokenPort.js';
import type { TokenPort } from '../../domain/ports/TokenPort.js';

export class JwtTokenAdapter implements TokenPort {
  constructor(
    private readonly deps: {
      accessSecret: string;
      accessExpires: string;
      refreshExpiresDays: number;
      tokens: RefreshTokenPort;
      users: UserPort;
    },
  ) {}

  // firma id, rol y correo en el access token
  signAccess(actor: Actor): string {
    return jwt.sign(
      { sub: actor.id, role: actor.role, email: actor.email },
      this.deps.accessSecret,
      { expiresIn: this.deps.accessExpires as SignOptions['expiresIn'] },
    );
  }

  async issueRefresh(userId: string): Promise<string> {
    // el refresh es aleatorio y en la base solo queda su hash
    const raw = randomBytes(48).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.deps.refreshExpiresDays);
    await this.deps.tokens.create({
      userId,
      tokenHash: hashToken(raw),
      expiresAt,
    });
    return raw;
  }

  async rotateRefresh(rawToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  } | null> {
    const stored = await this.deps.tokens.findValidByHash(hashToken(rawToken));
    if (!stored || stored.expiresAt < new Date()) return null;
    const user = await this.deps.users.getUserById(stored.userId);
    if (!user) return null;
    // el refresh usado se revoca para que no se reutilice
    await this.deps.tokens.revokeById(stored.id);
    return {
      accessToken: this.signAccess({ id: user.id, role: user.role, email: user.email }),
      refreshToken: await this.issueRefresh(user.id),
      user,
    };
  }

  async revokeRefresh(rawToken: string): Promise<void> {
    await this.deps.tokens.revokeByHash(hashToken(rawToken));
  }

  async revokeAll(userId: string): Promise<void> {
    await this.deps.tokens.revokeAllForUser(userId);
  }
}

export function hashToken(token: string): string {
  // el refresh en claro no se persiste, solo este hash
  return createHash('sha256').update(token).digest('hex');
}
