import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceEntity } from './services.entity';

@Entity({ name: 'zone_services' })
export class ZoneServiceEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'service_id' })
  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ nullable: false })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
