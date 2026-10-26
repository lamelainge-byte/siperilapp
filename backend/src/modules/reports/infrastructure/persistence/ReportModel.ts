// tabla report, pertenece a un usuario y, si aplica, a un sitio, la foto es una ruta, no el archivo
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { ReportStatus, ReportType } from '../../../../shared/utils/types.js';
import { SiteModel } from '../../../sites/infrastructure/persistence/SiteModel.js';
import { UserModel } from '../../../users/infrastructure/persistence/UserModel.js';

@Entity({ name: 'Report' })
export class ReportModel {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({
    type: 'enum',
    enum: ['unsafe_condition', 'work_accident', 'maintenance', 'road_accident', 'height_equipment'],
    enumName: 'ReportType',
  })
  reportType!: ReportType; // acto inseguro, accidente laboral, mantenimiento o vial

  @Column({ type: 'text' })
  userId!: string;

  @ManyToOne(() => UserModel, (user) => user.reports)
  @JoinColumn({ name: 'userId' })
  user!: UserModel; // autor del reporte

  @Column({ type: 'text' })
  company!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'timestamp', nullable: true })
  incidentDate!: Date | null;

  @Column({ type: 'text', nullable: true })
  incidentTime!: string | null;

  @Column({ type: 'text', nullable: true })
  shift!: string | null;

  @Column({ type: 'text', nullable: true })
  place!: string | null;

  @Column({ type: 'text', nullable: true })
  office!: string | null;

  @Column({ type: 'text', nullable: true })
  equipmentType!: string | null;

  @Column({ type: 'text', nullable: true })
  damageKind!: string | null;

  @Column({ type: 'text', nullable: true })
  siteId!: string | null;

  @ManyToOne(() => SiteModel, (site) => site.reports, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'siteId' })
  site!: SiteModel | null;

  @Column({ type: 'double precision', nullable: true })
  latitude!: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude!: number | null;

  @Column({ type: 'text', nullable: true })
  weatherSummary!: string | null; // texto que devolvio openweather

  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null; // ruta relativa de la evidencia en uploads

  @Column({
    type: 'enum',
    enum: ['pending', 'resolved'],
    enumName: 'ReportStatus',
    default: 'pending',
  })
  status!: ReportStatus; // pending al crear y resolved cuando el admin lo cierra

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  resolvedById!: string | null;

  @ManyToOne(() => UserModel, { nullable: true })
  @JoinColumn({ name: 'resolvedById' })
  resolvedBy!: UserModel | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
