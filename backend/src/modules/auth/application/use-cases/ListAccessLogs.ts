import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import type { WorkerIngress } from '../../domain/entities/AccessLog.js';
import type { AccessLogPort } from '../../domain/ports/AccessLogPort.js';

export class ListAccessLogs {
  constructor(private readonly logs: AccessLogPort) {}

  async execute(actor: Actor): Promise<WorkerIngress[]> {
    if (actor.role !== 'admin') {
      throw new AppError(403, 'Solo un administrador puede ver los ingresos');
    }
    return this.logs.list();
  }
}
