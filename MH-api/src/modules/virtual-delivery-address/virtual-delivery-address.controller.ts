import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileToBodyInterceptor } from 'src/common/decorators/api-file.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateVirtualAddressDto } from './dto/create-by-xlsx-file.dto';
import { VirtualDeliveryAddressService } from './virtual-delivery-address.service';

@Controller('virtual-delivery-address')
@ApiTags('Virtual delivery address')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class VirtualDeliveryAddressController {
  constructor(
    private readonly virtualDeliveryAddressService: VirtualDeliveryAddressService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'), FileToBodyInterceptor)
  createByXlsxFile(@Body() createVirtualAddressDto: CreateVirtualAddressDto) {
    return this.virtualDeliveryAddressService.virtualDeliveryAddressByXlsxFile(
      createVirtualAddressDto,
    );
  }
}
