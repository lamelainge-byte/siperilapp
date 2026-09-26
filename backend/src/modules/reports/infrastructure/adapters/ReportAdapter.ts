import type { FindOptionsWhere, Repository } from 'typeorm';
import { AppDataSource } from '../../../../shared/config/data-source.js';
import type { Report } from '../../domain/entities/Report.js';
import type {
  NewReport,
  ReportListFilter,
  ReportPort,
  ReportUpdates,
} from '../../domain/ports/ReportPort.js';
import { ReportModel } from '../persistence/ReportModel.js';

export class ReportAdapter implements ReportPort {
  private readonly reportRepository: Repository<ReportModel>;

  constructor() {
    this.reportRepository = AppDataSource.getRepository(ReportModel);
  }

  private toDomain(row: ReportModel): Report {
    return {
      id: row.id,
      reportType: row.reportType,
      userId: row.userId,
      company: row.company,
      description: row.description,
      incidentDate: row.incidentDate,
      incidentTime: row.incidentTime,
      shift: row.shift,
      place: row.place,
      siteId: row.siteId,
      latitude: row.latitude,
      longitude: row.longitude,
      weatherSummary: row.weatherSummary,
      imageUrl: row.imageUrl,
      status: row.status,
      resolvedAt: row.resolvedAt,
      resolvedById: row.resolvedById,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user ? { name: row.user.name, email: row.user.email } : undefined,
      resolvedBy: row.resolvedBy ? { name: row.resolvedBy.name } : null,
    };
  }

  async list(filter: ReportListFilter): Promise<Report[]> {
    const where: FindOptionsWhere<ReportModel> = {};
    if (filter.userId) where.userId = filter.userId;
    if (filter.company) where.company = filter.company;
    const rows = await this.reportRepository.find({
      where,
      order: { createdAt: 'DESC' }, // mas recientes primero, con autor y quien lo resolvio
      relations: ['user', 'resolvedBy'],
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Report | null> {
    const row = await this.reportRepository.findOne({
      where: { id },
      relations: ['user', 'resolvedBy'],
    });
    return row ? this.toDomain(row) : null;
  }

  async create(data: NewReport): Promise<Report> {
    const now = new Date();
    const saved = await this.reportRepository.save(
      this.reportRepository.create({
        ...data,
        id: crypto.randomUUID(),
        status: 'pending', // todo reporte nuevo queda pendiente
        createdAt: now,
        updatedAt: now,
      }),
    );
    const full = await this.findById(saved.id);
    if (!full) throw new Error('No se pudo leer el reporte creado');
    return full;
  }

  async update(id: string, data: ReportUpdates): Promise<Report> {
    const existing = await this.reportRepository.findOne({ where: { id } });
    if (!existing) throw new Error('Reporte no encontrado');
    Object.assign(existing, data, { updatedAt: new Date() });
    await this.reportRepository.save(existing);
    const full = await this.findById(id);
    if (!full) throw new Error('No se pudo leer el reporte actualizado');
    return full;
  }

  async delete(id: string): Promise<void> {
    await this.reportRepository.delete({ id });
  }

  async stats(company?: string) {
    const where = company ? { company } : {};
    // conteos para el panel: total, pendientes, resueltos y empresas
    const [total, pending, resolved, companies] = await Promise.all([
      this.reportRepository.count({ where }),
      this.reportRepository.count({ where: { ...where, status: 'pending' } }),
      this.reportRepository.count({ where: { ...where, status: 'resolved' } }),
      this.reportRepository
        .createQueryBuilder('report')
        .select('DISTINCT report.company', 'company')
        .getRawMany<{ company: string }>(),
    ]);
    return {
      total,
      pending,
      resolved,
      companies: companies.map((c) => c.company).filter(Boolean).sort(),
    };
  }
}
