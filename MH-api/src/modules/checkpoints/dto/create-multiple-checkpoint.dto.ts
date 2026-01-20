import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { CreateCheckPointAdminDto } from 'src/modules/trackings/dto/create-checkpoint-admin.dto';

export class CreateMultipleCheckpointDto {
  @ApiProperty()
  @IsString({ each: true })
  checkpointIds: string[];

  @ApiProperty()
  @Type(() => CreateCheckPointAdminDto)
  @ValidateNested()
  data: CreateCheckPointAdminDto;
}
