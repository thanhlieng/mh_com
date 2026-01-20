import {
  EExportForm,
  ETransportationType,
} from 'src/common/constants/common.constants';
import { ServiceEntity } from 'src/modules/services-booking/entities/services.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'connect_bill' })
export class ConnectBillEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'export_form', enum: EExportForm })
  exportForm: string; // Hình thức xuất khẩu

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'service_id' })
  @Column({ name: 'service_id' })
  serviceId: string; //Dịch vụ

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'partner_id' })
  @Column({ name: 'partner_id' })
  partnerId: string; // Dịch vụ kết nối

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'connection_partner_id' })
  @Column({ name: 'connection_partner_id', enum: ETransportationType })
  connectionPartnerId: string; //Đối tác kết nối

  @Column({ name: 'transportation_type' })
  transportationType: string; // Phương tiện vận chuyển

  @Column({ name: 'mawb_code' })
  mawbCode: string; //Mã MAWB/HAWB/CWB

  @Column({ name: 'flight_code' })
  flightCode: string; //Mã xuất/nhập

  @Column({ name: 'flight_time' })
  flightTime: Date; //Thời gian xuất/nhập

  @Column({ name: 'sending_airport' })
  sendingAirport: string; //Sân bay/Cảng/Nhà ga/ Nơi gửi

  @Column({ name: 'receiving_airport' })
  receivingAirport: string; // Sân bay/Cảng/Nhà ga/ Nơi nhận

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
