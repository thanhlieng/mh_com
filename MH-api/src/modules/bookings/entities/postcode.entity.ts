import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'postcodes' })
export class PostCodeEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'value' })
  value: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'town_name' })
  townName: string;

  @Column({ name: 'city_name' })
  cityName: string;

  @Column({ name: 'country_name' })
  countryName: string;
}
