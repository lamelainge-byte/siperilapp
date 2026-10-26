import type { AccessKind, WorkerIngress } from '../entities/AccessLog.js';

export type NewAccessLog = {
  userId: string;
  name: string;
  email: string;
  company: string;
  employeeNumber: string | null;
  kind: AccessKind;
};

export interface AccessLogPort {
  record(entry: NewAccessLog): Promise<void>;
  list(): Promise<WorkerIngress[]>;
}
