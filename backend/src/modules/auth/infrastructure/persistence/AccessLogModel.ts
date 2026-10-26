import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import type { AccessKind } from '../../domain/entities/AccessLog.js';

@Entity({ name: 'AccessLog' })
export class AccessLogModel {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  userId!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  email!: string;

  @Column({ type: 'text' })
  company!: string;

  @Column({ type: 'text', nullable: true })
  employeeNumber!: string | null;

  @Column({ type: 'text' })
  kind!: AccessKind;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
