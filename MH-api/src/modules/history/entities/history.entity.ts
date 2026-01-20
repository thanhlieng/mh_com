import { UserEntity } from 'src/modules/users/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'history' })
export class HistoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'code', type: 'int' })
  @Generated('increment')
  code: number;

  @Column({ name: 'record_id', type: 'uuid', nullable: true })
  recordId: string;

  @Column({ name: 'target_table', type: 'varchar', nullable: true })
  targetTable: string;

  @Column({ name: 'ip', type: 'varchar', nullable: true })
  ip: string;

  @Column({ name: 'method', type: 'varchar', nullable: true })
  method: string;

  @Column({ name: 'path', type: 'varchar', nullable: true })
  path: string;

  @Column({ name: 'type', type: 'varchar', nullable: true })
  type: string;

  @Column({ name: 'action', type: 'varchar', nullable: true })
  action: string;

  @Column({ name: 'old_item', type: 'jsonb', nullable: true })
  oldItem: any;

  @Column({ name: 'new_item', type: 'jsonb', nullable: true })
  newItem: any;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserEntity, (user) => user.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedUser: UserEntity;
}
