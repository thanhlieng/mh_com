import {
  EServiceRequest,
  ETypeContract,
} from 'src/common/constants/common.constants';
import { ServiceEntity } from 'src/modules/services-booking/entities/services.entity';
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
import { StaffsEntity } from 'src/modules/staffs/entities/staffs.entity';

@Entity({ name: 'contract' })
export class ContractEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CustomersEntity, (customer) => customer.id)
  @JoinColumn({ name: 'customer_id' })
  @Column({ name: 'customer_id', nullable: true })
  customerId?: string;

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'service' })
  @Column({ name: 'service', nullable: true })
  service: string;

  @Column({ name: 'contract_code', nullable: true })
  contractCode: string; // Mã hợp đồng

  @Column({ name: 'contract_name', nullable: true })
  contractName: string; // Tên hợp đồng

  @Column({ name: 'type_contract', enum: ETypeContract, nullable: true })
  typeContract: string; // Loại hợp đồng enum ETypeContract

  @Column({ name: 'contract_term_from', nullable: true })
  contractTermFrom?: Date; // Từ ngày

  @Column({ name: 'contract_term_to', nullable: true })
  contractTermTo?: Date; // Đến ngày

  @Column({ name: 'payment_schedule', nullable: true })
  paymentSchedule: string; // Lịch thanh toán công nợ kể từ ngày xuất hóa đơn

  @Column({ name: 'expertise', nullable: true, default: true })
  expertise: boolean; // Thẩm định

  @ManyToOne(() => StaffsEntity, (staff) => staff.id)
  @JoinColumn({ name: 'appraisal_staff' })
  @Column({ name: 'appraisal_staff', nullable: true })
  appraisalStaff: string; // Nhân viên thẩm định

  @Column({ name: 'note_contract', nullable: true })
  noteContract?: string; // ghi chú hợp đồng

  @Column('character varying', { nullable: true, array: true })
  files: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
