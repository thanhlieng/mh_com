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
import bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { ETypeUser, Status } from 'src/common/constants/common.constants';
import { RolesEntity } from '../roles/entities/roles.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: false, type: 'uuid', name: 'role_id' })
  @JoinColumn({ name: 'role_id' })
  @ManyToOne(() => RolesEntity, (role) => role.id)
  roleId: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: false, enum: Status, default: Status.INACTIVE })
  status: string;

  @Exclude()
  @Column({ nullable: true })
  salt: string;

  @Column({ enum: ETypeUser, default: ETypeUser.CLIENT })
  type: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  async validatePassword(password: string): Promise<boolean> {
    const hashPassword = await bcrypt.compare(password, this.password);
    return hashPassword;
  }
}
