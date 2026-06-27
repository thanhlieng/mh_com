import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { EALinkType } from 'src/modules/users/entities/user-a-link.entity';

/**
 * Body cho PUT /api/admin/account-links/:userId
 *
 * Một account chỉ thuộc đúng MỘT loại. Gửi `linkType=null` (hoặc bỏ trống)
 * cùng `ids=[]` để gỡ toàn bộ liên kết.
 */
export class SetAccountLinksDto {
  @ApiPropertyOptional({
    enum: EALinkType,
    nullable: true,
    description:
      "Loại liên kết: 'supplier' | 'customer'. null/bỏ trống = gỡ liên kết.",
  })
  @IsOptional()
  @ValidateIf((o) => o.linkType !== null)
  @IsEnum(EALinkType)
  linkType?: EALinkType | null;

  @ApiProperty({
    type: [String],
    description: 'Danh sách id thực thể bên mhvn (a_supplier_id / a_customer_id)',
    default: [],
  })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
