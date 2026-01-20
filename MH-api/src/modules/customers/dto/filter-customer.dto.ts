import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
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

  @ApiProperty({ required: false, enum: ECustomerStatus })
  @IsEnum(ECustomerStatus)
  @IsOptional()
  status: string;
}
