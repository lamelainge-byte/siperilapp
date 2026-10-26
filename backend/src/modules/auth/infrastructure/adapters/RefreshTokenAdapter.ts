import { IsNull, type Repository } from 'typeorm';
import { AppDataSource } from '../../../../shared/config/data-source.js';
import type { RefreshTokenPort, StoredRefreshToken } from '../../domain/ports/RefreshTokenPort.js';
import { RefreshTokenModel } from '../persistence/RefreshTokenModel.js';

export class RefreshTokenAdapter implements RefreshTokenPort {
  private readonly repository: Repository<RefreshTokenModel>;

  constructor() {
    // guarda el hash del refresh en la tabla refreshtoken, por la misma conexion
    this.repository = AppDataSource.getRepository(RefreshTokenModel);
  }

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await this.repository.save(this.repository.create({ ...data, id: crypto.randomUUID() }));
  }

  // solo cuenta un refresh que aun no fue revocado
  async findValidByHash(tokenHash: string): Promise<StoredRefreshToken | null> {
    return this.repository.findOne({
      where: { tokenHash, revokedAt: IsNull() },
    });
  }

  async revokeById(id: string): Promise<void> {
    await this.repository.update({ id }, { revokedAt: new Date() });
  }

  async revokeByHash(tokenHash: string): Promise<void> {
    await this.repository.update({ tokenHash }, { revokedAt: new Date() });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    // marca revocados todos los refresh vigentes de ese usuario
    await this.repository
      .createQueryBuilder()
      .update(RefreshTokenModel)
      .set({ revokedAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('revokedAt IS NULL')
      .execute();
  }
}
