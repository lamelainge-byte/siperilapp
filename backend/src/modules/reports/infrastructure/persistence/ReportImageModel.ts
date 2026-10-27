import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'ReportImage' })
export class ReportImageModel {
  @PrimaryColumn({ type: 'text' })
  filename!: string;

  @Column({ type: 'text' })
  mime!: string;

  @Column({ type: 'bytea' })
  data!: Buffer;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
