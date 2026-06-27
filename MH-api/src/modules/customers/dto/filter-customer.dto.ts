import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsUUID } from 'class-validator';
import { CustomerType, ECustomerStatus, NetWorkCustomerType, ServiceEnum } from 'src/common/constants/common.constants';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

export class FilterCustomerDto extends CommonPaginationDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  unitId: string;

  @ApiProperty({ required: false, enum: ServiceEnum })
  @IsEnum(ServiceEnum)
  @IsOptional()
  service: ServiceEnum;

  @ApiProperty({ required: false, enum: CustomerType })
  @IsEnum(CustomerType)
  @IsOptional()
  customerType: CustomerType;

  @ApiProperty({ required: false, enum: NetWorkCustomerType })
  @IsEnum(NetWorkCustomerType)
  @IsOptional()
  networkCustomerType: NetWorkCustomerType;

  // ACTIVE | INACTIVE | ALL. Bỏ trống → mặc định chỉ ACTIVE (ẩn khách đóng mã).
  @ApiProperty({ required: false, enum: [...Object.values(ECustomerStatus), 'ALL'] })
  @IsIn([...Object.values(ECustomerStatus), 'ALL'])
  @IsOptional()
  status: string;
}
