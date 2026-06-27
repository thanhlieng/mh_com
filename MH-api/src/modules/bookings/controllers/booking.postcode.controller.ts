import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostCodeService } from '../services/postcode.service';
import { GetPostCodeDto } from '../dto/get-postcode.dto';

@ApiTags('API Postcode')
@Controller('booking/postcode')
export class PostcodeController {
  constructor(private readonly postcodeService: PostCodeService) {}

  @Post()
  syncDataToDatabase() {
    return this.postcodeService.syncDataFromGoogleSheetToDatabase();
  }

  @Get()
  getListPostCode() {
    return this.postcodeService.getPostcodesFromGoogleSheet();
  }

  @Get('/:postcode')
  getPostcodeInfo(
    @Param('postcode') postcode: string,
    @Query() getPostCodeDto: GetPostCodeDto,
  ) {
    return this.postcodeService.getPostcodeInfoV2(postcode, getPostCodeDto);
  }
}
