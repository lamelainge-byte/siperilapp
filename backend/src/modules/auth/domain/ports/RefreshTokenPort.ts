// contrato de la tabla de refresh: crear, buscar uno no revocado y marcarlo como revocado
export type StoredRefreshToken = {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

export interface RefreshTokenPort {
  create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findValidByHash(tokenHash: string): Promise<StoredRefreshToken | null>;
  revokeById(id: string): Promise<void>;
  revokeByHash(tokenHash: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}
