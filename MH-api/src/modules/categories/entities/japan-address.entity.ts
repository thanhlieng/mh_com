import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: 'japan_address'})
export class JapanAddressEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'consignee_name_englsh' })
  @Index()
  consigneeNameEnglish: string;

  @Column({ name: 'consignee_name_japanese', nullable: true })
  consigneeNameJapanese: string;

  @Column({ name: 'consignee_code', nullable: true })
  consigneeCode: string;

  @Column({ name: 'registered_company_name', nullable: true })
  registeredCompanyName: string;

  @Column({ name: 'address', nullable: true })
  address: string;
}
