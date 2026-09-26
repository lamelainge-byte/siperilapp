import type { Repository } from 'typeorm';
import { AppDataSource } from '../../../../shared/config/data-source.js';
import { ReportModel } from '../../../reports/infrastructure/persistence/ReportModel.js';
import type { Site } from '../../domain/entities/Site.js';
import type { NewSite, SitePort, SiteUpdates } from '../../domain/ports/SitePort.js';
import { SiteModel } from '../persistence/SiteModel.js';

export class SiteAdapter implements SitePort {
  private readonly siteRepository: Repository<SiteModel>;
  private readonly reportRepository: Repository<ReportModel>;

  constructor() {
    this.siteRepository = AppDataSource.getRepository(SiteModel);
    this.reportRepository = AppDataSource.getRepository(ReportModel);
  }

  private toDomain(entity: SiteModel): Site {
    return {
      id: entity.id,
      name: entity.name,
      company: entity.company,
      address: entity.address,
      area: entity.area,
      active: entity.active,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  async list(company?: string): Promise<Site[]> {
    const rows = await this.siteRepository.find({
      where: company ? { company } : {},
      order: { name: 'ASC' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Site | null> {
    const row = await this.siteRepository.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async create(data: NewSite): Promise<Site> {
    const now = new Date();
    return this.toDomain(
      await this.siteRepository.save(
        this.siteRepository.create({ ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }),
      ),
    );
  }

  async update(id: string, data: SiteUpdates): Promise<Site> {
    const existing = await this.siteRepository.findOne({ where: { id } });
    if (!existing) throw new Error('Sitio no encontrado');
    Object.assign(existing, data, { updatedAt: new Date() });
    return this.toDomain(await this.siteRepository.save(existing));
  }

  async delete(id: string): Promise<void> {
    await this.siteRepository.delete({ id });
  }

  async countReports(siteId: string): Promise<number> {
    // cuenta cuantos reportes apuntan a este sitio antes de borrarlo
    return this.reportRepository.count({ where: { siteId } });
  }
}
