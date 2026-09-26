import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import type { Role } from '../../../../shared/utils/types.js';
import type { RefreshTokenModel } from '../../../auth/infrastructure/persistence/RefreshTokenModel.js';
import type { ReportModel } from '../../../reports/infrastructure/persistence/ReportModel.js';

@Entity({ name: 'User' })
export class UserModel {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', unique: true })
  email!: string; // no se repite entre cuentas

  @Column({ type: 'text' })
  passwordHash!: string;

  @Column({ type: 'text' })
  company!: string;

  // worker usa la app y admin administra reportes y usuarios
  @Column({ type: 'enum', enum: ['worker', 'admin'], enumName: 'Role', default: 'worker' })
  role!: Role;

  // 1 activo y 0 desactivado, el login rechaza el 0
  @Column({ type: 'int', default: 1 })
  status!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @OneToMany('ReportModel', 'user')
  reports!: ReportModel[];

  @OneToMany('RefreshTokenModel', 'user')
  refreshTokens!: RefreshTokenModel[];
}
