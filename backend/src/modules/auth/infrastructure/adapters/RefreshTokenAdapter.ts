import { IsNull, type Repository } from 'typeorm';
import { AppDataSource } from '../../../../shared/config/data-source.js';
import type { RefreshTokenPort, StoredRefreshToken } from '../../domain/ports/RefreshTokenPort.js';
import { RefreshTokenModel } from '../persistence/RefreshTokenModel.js';

export class RefreshTokenAdapter implements RefreshTokenPort {
  private readonly repository: Repository<RefreshTokenModel>;

  constructor() {
    this.repository = AppDataSource.getRepository(RefreshTokenModel);
  }

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    await this.repository.save(this.repository.create({ ...data, id: crypto.randomUUID() }));
  }

  // solo cuenta un refresh que aun no fue revocado
  async findValidByHash(tokenHash: string): Promise<StoredRefreshToken | null> {
    return this.repository.findOne({
      where: { tokenHash, revokedAt: IsNull() },
    });
  }

  async revokeById(id: string) {
    await this.repository.update({ id }, { revokedAt: new Date() });
  }

  async revokeByHash(tokenHash: string) {
    await this.repository.update({ tokenHash }, { revokedAt: new Date() });
  }

  async revokeAllForUser(userId: string) {
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
