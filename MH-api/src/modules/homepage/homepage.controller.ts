import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Patch,
  Param,
  UseGuards,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { HomepageService } from './homepage.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetHomepageDto } from './dto/get-homepage.dto';
import { CreateHomePageDto } from './dto/create.dto';
import { UpdateHomePageDto } from './dto/update.dto';
import { GetHomepageAdminDto } from './dto/get-homepage-admin.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ParamsDto } from 'src/common/dto/common';

@Controller('homepage')
@ApiTags('Homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Post()
  createItemHomepage(@Body() createItemHomePageDto: CreateHomePageDto) {
    return this.homepageService.createItemHomepage(createItemHomePageDto);
  }

  @Get()
  getHomepage(@Query() getHomepageDto: GetHomepageDto) {
    return this.homepageService.getHomepage(getHomepageDto);
  }

  @Get('/admin')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getHomepageAdmin(@Query() getHomepageAdminDto: GetHomepageAdminDto) {
    return this.homepageService.getHomepageAdmin(getHomepageAdminDto);
  }

  @Get('/:id')
  getDetail(
    @Param(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paramsDto: ParamsDto,
  ) {
    return this.homepageService.getDetail(paramsDto.id);
  }

  @Patch('/:id')
  updateItemHomepage(
    @Param(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paramsDto: ParamsDto,
    @Body() updateItemHomepageDto: UpdateHomePageDto,
  ) {
    return this.homepageService.updateItemHomepage(
      paramsDto.id,
      updateItemHomepageDto,
    );
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  removeItemHomepage(
    @Param(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paramsDto: ParamsDto,
  ) {
    return this.homepageService.removeItemHomepage(paramsDto.id);
  }
}
