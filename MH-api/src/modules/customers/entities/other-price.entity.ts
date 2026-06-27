import { ZoneServiceEntity } from 'src/modules/services-booking/entities/zone-services.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PriceListEntity } from './price-list.entity';

@Entity({ name: 'other_price' })
export class OtherPriceEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PriceListEntity, (priceList) => priceList.id)
  @JoinColumn({ name: 'price_list_id' })
  @Column({ name: 'price_list_id' })
  priceListId: string;

  @ManyToOne(() => ZoneServiceEntity, (zoneService) => zoneService.id)
  @JoinColumn({ name: 'country_contract_id' })
  @Column({ name: 'country_contract_id', nullable: true })
  countryContractId?: string; // Country hoặc Zone // /service/zone-small-service/:id

  @Column({ name: 'discount_rate', type: 'text', nullable: true })
  discountRate?: string; // Tỷ lệ giảm giá (Đánh tỷ lệ %)

  @Column({ name: 'note_other_price', nullable: true })
  noteOtherPrice?: string;
}
