// tabla refreshtoken, guarda el hash del refresh, revokedat con fecha significa que el logout ya lo invalido
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserModel } from '../../../users/infrastructure/persistence/UserModel.js';

@Entity({ name: 'RefreshToken' })
export class RefreshTokenModel {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  tokenHash!: string; // hash sha256, nunca el token en claro

  @Column({ type: 'text' })
  userId!: string;

  @ManyToOne(() => UserModel, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserModel; // si se borra el usuario caen sus refresh

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt!: Date | null; // con fecha el token ya no sirve

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
