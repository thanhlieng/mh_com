import { ETypeStatisticalRevenueCustomer } from '@constants/common.constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

export class StatisticalByStaffDto extends CommonPaginationDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  staffId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  from: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  to: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search: string;
}

export class StatisticalByCustomerDto extends CommonPaginationDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  customerId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  salesId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  year: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  from: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  to: Date;
}

export class StatisticalByServiceDto extends CommonPaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  year: number;
}

export class StatisticalRevenueByCustomerDto extends CommonPaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  year: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  month: number;

  @IsEnum(ETypeStatisticalRevenueCustomer)
  @IsOptional()
  typeStatistical: ETypeStatisticalRevenueCustomer;
}

export const ExportStatisticalFileColumnName = [
  'Ngày xuất',
  'Số bill gốc',
  'Số bill đối tác',
  'Mã khách hàng',
  'Tên khách hàng',
  'Kinh doanh',
  'Loại gửi',
  'Kí hiệu nước',
  'Nước gửi',
  'Hình thức xuất',
  'Điều kiện giao hàng',
  'Dịch vụ gửi',
  'Dịch vụ Checkout',
  'Nhà cung cấp chính',
  'TTGD Quản lý',
  'Nhóm Dịch vụ',
  'TL tính cước',
  'Điều chỉnh TL Tính cước',
  'TL Đối tác chốt',
  'Loại thanh toán',
  'Giá bán PHÍ BIẾN ĐỘNG',
  'Giá vốn PHÍ BIẾN ĐỘNG',
  'Giá bán PHÍ HÀNG HÓA',
  'Giá vốn PHÍ HÀNG HÓA',
  'Giá bán PHÍ KHÁC',
  'Giá vốn PHÍ KHÁC',
  'Giá bán GOM, DELIVERY…',
  'Giá vốn GOM, DELIVERY…',
  'Giá bán HANDLING (XỬ LÝ HẢI QUAN…)',
  'Giá vốn HANDLING (XỬ LÝ HẢI QUAN…)',
  'Giá bán TRUCKING, KẾT NỐI…',
  'Giá vốn TRUCKING, KẾT NỐI…',
  'Giá bán TỜ KHAI/CO…',
  'Giá vốn TỜ KHAI/CO…',
  'Giá bán KHÁC…',
  'Giá vốn KHÁC…',
  'NCC PP Gom, Delivery, Trucking, Kết nối…',
  'NCC Tờ khai, CO…',
  'NCC Handling, Khác…',
  'Loại bảng giá',
  'Gía bán BẢNG',
  'Gía mua BẢNG',
  'LKD/GIÁ BÁN',
  'Giá bán TỔNG PP+/GIÁ',
  'Giá vốn TỔNG PP+/GIÁ',
  'Tổng giá bán + PP trước PPXD',
  'Tổng giá vốn + PP trước PPXD',
  'Giá bán PPXD',
  'Giá vốn PPXD',
  'Giá bán TỔNG PP NGOÀI',
  'Giá vốn TỔNG PP NGOÀI',
  'TỔNG DOANH SỐ THEO LOẠI TIỀN BÁN RA',
  'TỔNG GIÁ VỐN THEO LOẠI TIỀN BÁN RA',
  'Tổng Lợi nhuận theo loại tiền bán ra',
  'Tỷ suất LN/ DT',
  'VAT',
  'TỔNG Doanh số Cả VAT',
  'TỔNG DOANH SỐ QUY ĐỔI',
  'TỔNG GIÁ VỐN QUY ĐỔI',
  'Tổng Lợi nhuận QUY ĐỔI',
  'Tỷ suất LN/ DT QUY ĐỔI',
  'VAT QUY ĐỔI',
  'TỔNG Doanh số Cả VAT QUY ĐỔI',
  'DOANH THU GỐC TRƯỚC CHÊNH',
  'SỐ TIỀN CHÊNH GIÁ',
  'GIÁ VỐN THEO NCC CHÍNH',
  'TỔNG GIÁ VỐN THEO LOẠI TIỀN NCC CHÍNH',
  'LOẠI XUẤT HÓA ĐƠN CỦA NCC CHÍNH',
  'CHECK',
  'NOTE',
];

export const ExportStatisticalViaCustomerFileColumnName = [
  [
    'STT',
    'Mã khách hàng',
    'Tên khách hàng',
    'Kinh doanh',
    'Ngày mở mã/ Active lại',
    'Thông tin đơn vị',
    'Nhóm Khách hàng / Nhà cung cấp',
    'THÁNG 1',
    '',
    '',
    '',
    'THÁNG 2',
    '',
    '',
    '',
    'THÁNG 3',
    '',
    '',
    '',
    'THÁNG 4',
    '',
    '',
    '',
    'THÁNG 5',
    '',
    '',
    '',
    'THÁNG 6',
    '',
    '',
    '',
    'THÁNG 7',
    '',
    '',
    '',
    'THÁNG 8',
    '',
    '',
    '',
    'THÁNG 9',
    '',
    '',
    '',
    'THÁNG 10',
    '',
    '',
    '',
    'THÁNG 11',
    '',
    '',
    '',
    'THÁNG 12',
    '',
    '',
    '',
    'TỔNG',
    '',
    '',
    '',
  ],
  [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
  ],
];

export const ExportStatisticalViaServiceFileColumnName = [
  [
    'STT',
    'Dịch vụ gửi',
    'THÁNG 1',
    '',
    '',
    '',
    'THÁNG 2',
    '',
    '',
    '',
    'THÁNG 3',
    '',
    '',
    '',
    'THÁNG 4',
    '',
    '',
    '',
    'THÁNG 5',
    '',
    '',
    '',
    'THÁNG 6',
    '',
    '',
    '',
    'THÁNG 7',
    '',
    '',
    '',
    'THÁNG 8',
    '',
    '',
    '',
    'THÁNG 9',
    '',
    '',
    '',
    'THÁNG 10',
    '',
    '',
    '',
    'THÁNG 11',
    '',
    '',
    '',
    'THÁNG 12',
    '',
    '',
    '',
    'TỔNG',
    '',
    '',
    '',
  ],
  [
    '',
    '',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
    'Doanh thu',
    'Giá vốn',
    'Lợi nhuận',
    'Tỷ suất LN',
  ],
];

export const ExportStatisticalRevenueViaCustomerColumnName = [
  [
    'STT',
    'Mã khách hàng',
    'Tên khách hàng',
    'Kinh doanh',
    'Ngày mở mã/ Active lại',
    'Thông tin đơn vị',
    'Nhóm Khách hàng / Nhà cung cấp',
    'Doanh thu tháng hiện tại (N)',
    'Doanh thu tháng trước (N-1)',
    'Doanh thu tháng trước (N-2)',
    'Doanh thu tháng trước (N-3)',
    'Doanh thu tháng trước (N-4)',
    'Doanh thu tháng trước (N-5)',
    'Doanh thu tháng trước (N-6)',
    'Doanh thu TB 3 tháng liền kề',
    'Khách hàng gửi giảm',
    'Khách hàng gửi tăng',
  ]
]