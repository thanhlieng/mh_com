import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LevelStaffsService } from './level-staffs.service';
import { CreateLevelStaffsDto } from './dto/create-level-staffs.dto';
import { UpdateLevelStaffsDto } from './dto/update-level-staffs.dto';
import { ResponseLevelStaffsDto } from './dto/response-level-staffs.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('LevelStaffs')
@Controller('level-staffs')
export class LevelStaffsController {
  constructor(private readonly levelStaffsService: LevelStaffsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseLevelStaffsDto })
  @ApiBearerAuth()
  create(@Body() createLevelStaffsDto: CreateLevelStaffsDto) {
    return this.levelStaffsService.create(createLevelStaffsDto);
  }

  @Get()
  @ApiOkResponse({ type: [ResponseLevelStaffsDto] })
  findAll() {
    return this.levelStaffsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseLevelStaffsDto })
  findOne(@Param('id') id: string) {
    return this.levelStaffsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseLevelStaffsDto })
  update(
    @Param('id') id: string,
    @Body() updateLevelStaffsDto: UpdateLevelStaffsDto,
  ) {
    return this.levelStaffsService.update(id, updateLevelStaffsDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse()
  remove(@Param('id') id: string) {
    return this.levelStaffsService.remove(id);
  }
}
