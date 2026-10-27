import type { Repository } from 'typeorm';
import { AppDataSource } from '../../../../shared/config/data-source.js';
import type { ReportImagePort, StoredImage } from '../../domain/ports/ReportImagePort.js';
import { ReportImageModel } from '../persistence/ReportImageModel.js';

export class ReportImageAdapter implements ReportImagePort {
  private readonly images: Repository<ReportImageModel>;

  constructor() {
    this.images = AppDataSource.getRepository(ReportImageModel);
  }

  async save(filename: string, mime: string, data: Buffer): Promise<void> {
    // la foto queda en postgres para sobrevivir un reinicio del servidor
    await this.images.save(
      this.images.create({
        filename,
        mime,
        data,
        createdAt: new Date(),
      }),
    );
  }

  async find(filename: string): Promise<StoredImage | null> {
    const row = await this.images.findOne({ where: { filename } });
    if (!row) return null;
    const data = Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data);
    return { mime: row.mime, data };
  }

  async remove(filename: string): Promise<void> {
    await this.images.delete({ filename });
  }
}
