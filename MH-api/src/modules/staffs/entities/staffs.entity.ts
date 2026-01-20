import { Gender, Status } from 'src/common/constants/common.constants';
import { DepartmentEntity } from 'src/modules/departments/entities/departments.entity';
import { UnitsEntity } from 'src/modules/units/entities/units.entity';
import { UserEntity } from 'src/modules/users/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'staffs' })
export class StaffsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'staff_code', nullable: false, unique: true })
  staffCode: string;

  @Column({ name: 'status', enum: Status, default: Status.ACTIVE })
  status: string;

  @Column({ nullable: true, type: 'uuid', name: 'unit_id' })
  @JoinColumn({ name: 'unit_id' })
  @ManyToOne(() => UnitsEntity, (unit) => unit.id)
  unitId: string;

  @Column({ nullable: true, type: 'uuid', name: 'user_id' })
  @JoinColumn({ name: 'user_id' })
  @OneToOne(() => UserEntity, (user) => user.id)
  userId: string;

  @Column({ nullable: true, type: 'uuid', name: 'department_id' })
  @JoinColumn({ name: 'department_id' })
  @ManyToOne(() => DepartmentEntity, (department) => department.id)
  departmentId: string;

  @Column({ nullable: false, name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: false, enum: Gender })
  gender: string;

  @Column({ nullable: false, name: 'day_of_birth' })
  dayOfBirth: Date;

  @Column({ nullable: false, name: 'place_of_birth' })
  placeOfBirth: string;

  @Column({ nullable: false, name: 'temporary_address' })
  temporaryAddress: string;

  @Column({ nullable: false, name: 'permanent_address' })
  permanentAddress: string;

  @Column({ nullable: false })
  ethnic: string;

  @Column({ nullable: false })
  religion: string;

  @Column({ nullable: false })
  nationality: string;

  @Column({ nullable: false })
  level: string;

  @Column({ nullable: false })
  marital: string;

  @Column({ nullable: true })
  element: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true, name: 'email_company' })
  emailCompany: string;

  @Column({ nullable: false, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: false, name: 'phone_code' })
  phoneCode: string;

  @Column({ nullable: false, name: 'people_id' })
  peopleId: string;

  @Column({ nullable: false, name: 'issue_date' })
  issueDate: Date;

  @Column({ nullable: false, name: 'issue_place' })
  issuePlace: string;

  @Column({ nullable: false })
  region: string;

  @Column({ nullable: true, name: 'tax_code' })
  taxCode: string;

  @Column({ nullable: true, name: 'bank_account_number' })
  bankAccountNumber: string;

  @Column({ nullable: true, name: 'bank_code' })
  bankCode: string;

  @Column({ nullable: true, name: 'social_insurance_id' })
  socialInsuranceId: string;

  @Column({ nullable: true, name: 'health_insurance_id' })
  healthInsuranceId: string;

  @Column({ nullable: true, name: 'union_book_number' })
  unionBookNumber: string;

  @Column({ nullable: true, name: 'insurance_participation_date' })
  insuranceParticipationDate: Date;

  @Column({ nullable: true, name: 'issue_insurance_date' })
  issueInsuranceDate: Date;

  @Column({ nullable: true, name: 'latest_promotion_date' })
  latestPromotionDate: Date;

  @Column('character varying', { nullable: true, array: true })
  files: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  unit?: UnitsEntity;
}
