import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

@Entity({ name: 'companies' })
export class CompaniesEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
