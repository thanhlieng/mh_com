import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'virtual_delivery_address' })
export class VirtualDeliveryAddressEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  province: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: true, name: 'postal_code' })
  postalCode: string;

  @Column({ nullable: true, type: 'float' })
  weight: number;
}
