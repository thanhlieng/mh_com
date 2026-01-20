import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'ml_exchange_rates' })
export class MLExchangeRateEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, name: 'from_currency' })
  fromCurrency: string;

  @Column({ nullable: false, name: 'to_currency' })
  toCurrency: string;

  @Column({ nullable: false, name: 'rate' })
  rate: number;

  @Column({ nullable: false, name: 'time_apply_from' })
  timeApplyFrom: Date;

  @Column({ nullable: false, name: 'time_apply_to' })
  timeApplyTo: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
