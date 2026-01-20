import { IsEnum } from 'class-validator';
import { ETypeStaff } from 'src/common/constants/common.constants';
import { StaffsEntity } from 'src/modules/staffs/entities/staffs.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomersEntity } from './customers.entity';

@Entity({ name: 'management_staff' })
export class ManagementStaffEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CustomersEntity, (customer) => customer.id)
  @JoinColumn({ name: 'customer_id' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => StaffsEntity, (staff) => staff.id)
  @JoinColumn({ name: 'staff_id' })
  @Column({ name: 'staff_id' })
  staffId: string;

  @Column({ name: 'type_staff', enum: ETypeStaff })
  @IsEnum(ETypeStaff)
  typeStaff: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  staff?: StaffsEntity;
}
