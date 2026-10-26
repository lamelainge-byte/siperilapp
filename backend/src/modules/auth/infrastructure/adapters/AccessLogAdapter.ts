import type { Repository } from 'typeorm';
import { AppDataSource } from '../../../../shared/config/data-source.js';
import type { WorkerIngress } from '../../domain/entities/AccessLog.js';
import type { AccessLogPort, NewAccessLog } from '../../domain/ports/AccessLogPort.js';
import { AccessLogModel } from '../persistence/AccessLogModel.js';

export class AccessLogAdapter implements AccessLogPort {
  private readonly logs: Repository<AccessLogModel>;

  constructor() {
    this.logs = AppDataSource.getRepository(AccessLogModel);
  }

  async record(entry: NewAccessLog): Promise<void> {
    // la segunda entrada del mismo tipo no crea otra fila
    const already = await this.logs.findOne({ where: { userId: entry.userId, kind: entry.kind } });
    if (already) return;
    await this.logs.save(
      this.logs.create({
        ...entry,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      }),
    );
  }

  async list(): Promise<WorkerIngress[]> {
    const rows = await this.logs.find({ order: { createdAt: 'ASC' } });
    const byUser = new Map<string, WorkerIngress>();
    for (const row of rows) {
      const current = byUser.get(row.userId) ?? {
        id: row.userId,
        userId: row.userId,
        name: row.name,
        email: row.email,
        company: row.company,
        employeeNumber: row.employeeNumber,
        registeredAt: null,
        loggedInAt: null,
      };
      current.name = row.name;
      current.email = row.email;
      current.company = row.company;
      current.employeeNumber = row.employeeNumber;
      if (row.kind === 'register' && !current.registeredAt) current.registeredAt = row.createdAt;
      if (row.kind === 'login' && !current.loggedInAt) current.loggedInAt = row.createdAt;
      byUser.set(row.userId, current);
    }
    return [...byUser.values()].sort((a, b) => {
      const aTime = a.loggedInAt ?? a.registeredAt ?? new Date(0);
      const bTime = b.loggedInAt ?? b.registeredAt ?? new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
  }
}
