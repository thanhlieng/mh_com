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
  Query,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostsDto } from './dto/create-posts.dto';
import { UpdatePostsDto } from './dto/update-posts.dto';
import {
  ResponseListPostDto,
  ResponsePostsDto,
} from './dto/response-posts.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GetPostDto } from './dto/search-post.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCategoryDto } from './dto/get-category.dto';
import { GetSimilarPostDto } from './dto/get-similar-post.dto';
import { ParamsDto } from 'src/common/dto/common';
import { Permission } from 'src/common/decorators/permission.decorator';
import {
  EModulePermissionName,
  EPermissionActionKey,
  EPermissionDescription,
} from 'src/common/guards/permission';

const moduleName = EModulePermissionName.MANAGE_HOMEPAGE;
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission({
    action: EPermissionActionKey.MANAGE_HOMEPAGE,
    description: EPermissionDescription.MANAGE_HOMEPAGE,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: ResponsePostsDto })
  create(@Body() createPostsDto: CreatePostsDto) {
    return this.postsService.create(createPostsDto);
  }

  @Post('create-category-post')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission({
    action: EPermissionActionKey.MANAGE_HOMEPAGE,
    description: EPermissionDescription.MANAGE_HOMEPAGE,
    moduleName: moduleName,
  })
  createCategoryPost(@Body() createCategoryPostDto: CreateCategoryDto) {
    return this.postsService.createCategoryPost(createCategoryPostDto);
  }

  @Get('category')
  findAllCategory(@Query() getCategoryDto: GetCategoryDto) {
    return this.postsService.findAllCategory(getCategoryDto);
  }

  @Get()
  @ApiOkResponse({ type: ResponseListPostDto })
  findAll(@Query() getPostDto: GetPostDto) {
    return this.postsService.findAll(getPostDto);
  }

  @Get('/category/:id')
  getCategoryDetail(
    @Param(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paramsDto: ParamsDto,
  ) {
    return this.postsService.findCategoryDetail(paramsDto.id);
  }

  @Get('similar-posts/:id')
  getSimilarPosts(
    @Param(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paramsDto: ParamsDto,
    @Query() getSimilarPostDto: GetSimilarPostDto,
  ) {
    return this.postsService.getSimilarPosts(paramsDto.id, getSimilarPostDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponsePostsDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponsePostsDto })
  @Permission({
    action: EPermissionActionKey.MANAGE_HOMEPAGE,
    description: EPermissionDescription.MANAGE_HOMEPAGE,
    moduleName: moduleName,
  })
  update(
    @Param(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paramsDto: ParamsDto,
    @Body() updatePostsDto: UpdatePostsDto,
  ) {
    return this.postsService.update(paramsDto.id, updatePostsDto);
  }

  @Patch('/category/:id')
  @Permission({
    action: EPermissionActionKey.MANAGE_HOMEPAGE,
    description: EPermissionDescription.MANAGE_HOMEPAGE,
    moduleName: moduleName,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  updateCategory(
    @Param(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paramsDto: ParamsDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.postsService.updateCategory(paramsDto.id, updateCategoryDto);
  }

  @Delete(':id')
  @Permission({
    action: EPermissionActionKey.MANAGE_HOMEPAGE,
    description: EPermissionDescription.MANAGE_HOMEPAGE,
    moduleName: moduleName,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse()
  remove(
    @Param(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paramsDto: ParamsDto,
  ) {
    return this.postsService.removePost(paramsDto.id);
  }

  @Delete('/category/:id')
  @Permission({
    action: EPermissionActionKey.MANAGE_HOMEPAGE,
    description: EPermissionDescription.MANAGE_HOMEPAGE,
    moduleName: moduleName,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse()
  removeCategoryPost(
    @Param(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paramsDto: ParamsDto,
  ) {
    return this.postsService.removeCategoryPost(paramsDto.id);
  }
}
