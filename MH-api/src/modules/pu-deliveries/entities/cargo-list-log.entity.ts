import { CustomersEntity } from 'src/modules/customers/entities/customers.entity';
import { UserEntity } from 'src/modules/users/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'cargo_list_log' })
export class CargoListLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => CustomersEntity, (customer) => customer.id)
  @JoinColumn({ name: 'customer_id' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @Column()
  month: number;

  @Column()
  year: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
