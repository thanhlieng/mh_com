import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  EALinkType,
  EATarget,
} from 'src/modules/users/entities/user-a-link.entity';

/**
 * Một entry trong `targets[]`: target + danh sách entity ids ở target đó.
 */
export class SetAccountLinkTargetDto {
  @ApiProperty({ enum: EATarget, description: "Target hệ A: 'mhvn' | 'gp'" })
  @IsEnum(EATarget)
  a_target: EATarget;

  @ApiProperty({
    type: [String],
    description: 'Danh sách id thực thể bên hệ A (supplier_id hoặc customer_id)',
    default: [],
  })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

/**
 * Body cho PUT /api/admin/account-links/:userId
 *
 * Một account chỉ thuộc đúng MỘT loại (supplier HOẶC customer) cố định cho
 * toàn bộ target. Gửi `linkType=null` cùng `targets=[]` để gỡ TOÀN BỘ liên
 * kết của account.
 */
export class SetAccountLinksDto {
  @ApiPropertyOptional({
    enum: EALinkType,
    nullable: true,
    description:
      "Loại liên kết của account: 'supplier' | 'customer'. null = gỡ liên kết.",
  })
  @IsOptional()
  @ValidateIf((o) => o.linkType !== null)
  @IsEnum(EALinkType)
  linkType?: EALinkType | null;

  @ApiProperty({
    type: [SetAccountLinkTargetDto],
    description: 'Liên kết theo từng target hệ A',
    default: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetAccountLinkTargetDto)
  targets: SetAccountLinkTargetDto[];
}
