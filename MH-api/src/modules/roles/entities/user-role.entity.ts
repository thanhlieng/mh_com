import { UserEntity } from 'src/modules/users/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolesEntity } from './roles.entity';

@Entity({ name: 'user_role' })
export class UserRoleEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => RolesEntity, (role) => role.id)
  @JoinColumn({ name: 'role_id' })
  roleId: string;
}
