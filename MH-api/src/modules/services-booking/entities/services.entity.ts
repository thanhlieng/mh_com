import { ETypeService } from 'src/common/constants/common.constants';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'services' })
export class ServiceEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  key: string;

  @Column({ name: 'code_aftership', nullable: true })
  codeAftership: string;

  @Column('numeric', { name: 'coefficient', nullable: true })
  coefficient: number;

  @Column({ name: 'html_template', nullable: true })
  htmlTemplate: string;

  @Column({
    name: 'type_service',
    enum: ETypeService,
    default: ETypeService.SERVICE_BOOKING,
  })
  typeService: string;

  @Column({ name: 'icon', nullable: true })
  icon: string;

  @Column({ name: 'zone', nullable: true })
  zone: string;

  @Column({ name: 'time_zone_offset', default: 7 })
  timeZoneOffset: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
