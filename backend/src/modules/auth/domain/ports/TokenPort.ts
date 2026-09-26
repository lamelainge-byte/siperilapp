import type { Actor } from '../../../../shared/utils/types.js';
import type { User } from '../../../users/domain/entities/User.js';

export interface TokenPort {
  signAccess(actor: Actor): string;
  issueRefresh(userId: string): Promise<string>;
  rotateRefresh(rawToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  } | null>;
  revokeRefresh(rawToken: string): Promise<void>;
  revokeAll(userId: string): Promise<void>;
}
