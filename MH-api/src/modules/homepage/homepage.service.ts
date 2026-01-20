import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HomePageEntity } from './entities/homepage.entity';
import { Repository } from 'typeorm';
import { IHomepage } from './interface/homepage.interface';
import { GetHomepageDto } from './dto/get-homepage.dto';
import { CreateHomePageDto } from './dto/create.dto';
import { UpdateHomePageDto } from './dto/update.dto';
import { GetHomepageAdminDto } from './dto/get-homepage-admin.dto';
import { CommonPagination } from 'src/common/helper/common-pagination';
import { ETypeLinkHomepage } from 'src/common/constants/common.constants';

@Injectable()
export class HomepageService {
  constructor(
    @InjectRepository(HomePageEntity)
    private readonly homepageRepository: Repository<HomePageEntity>,
  ) {}

  // Seed //
  createHomepageSeed(input: IHomepage[]) {
    return this.homepageRepository.save(input);
  }

  ////////////////////////////////////

  async createItemHomepage(createItemHomePageDto: CreateHomePageDto) {
    const { position, type, typeLink } = createItemHomePageDto;
    if (!position) {
      const countTotalItemHomepage = await this.homepageRepository.count({
        where: {
          type: type,
        },
      });
      createItemHomePageDto['position'] = countTotalItemHomepage + 1;
    }

    return this.homepageRepository.save({
      ...createItemHomePageDto,
      categoryId:
        typeLink === ETypeLinkHomepage.CATEGORY
          ? createItemHomePageDto.link
          : undefined,
      postId:
        typeLink === ETypeLinkHomepage.POST
          ? createItemHomePageDto.link
          : undefined,
    });
  }

  async getDetail(id: string) {
    const item = await this.homepageRepository.findOne({
      where: {
        id,
      },
    });

    if (!item) throw new NotFoundException();

    return item;
  }

  async updateItemHomepage(
    id: string,
    updateItemHomepageDto: UpdateHomePageDto,
  ) {
    const itemHomepage = await this.homepageRepository.findOne({
      where: {
        id,
      },
    });
    if (!itemHomepage) {
      throw new NotFoundException();
    }

    return this.homepageRepository.update({ id: id }, updateItemHomepageDto);
  }

  async getHomepage(getHomepageDto: GetHomepageDto) {
    const { type } = getHomepageDto;

    const query = this.homepageRepository
      .createQueryBuilder('homepage')
      .leftJoinAndMapOne(
        'homepage.category',
        'categories_post',
        'category',
        'category.id = homepage.category_id',
      )
      .leftJoinAndMapMany(
        'category.posts',
        'posts',
        'posts',
        'posts.category_id = category.id',
      )
      .leftJoinAndMapOne(
        'homepage.post',
        'posts',
        'post',
        'post.id = homepage.post_id',
      )
      .where('homepage.active = :active', {
        active: true,
      });

    if (type) {
      query.andWhere('homepage.type = :type', {
        type,
      });
    }

    query.orderBy('homepage.position', 'ASC');

    return query.getMany();
  }

  async getHomepageAdmin(getHomepageAdminDto: GetHomepageAdminDto) {
    const { search } = getHomepageAdminDto;

    const query = this.homepageRepository.createQueryBuilder('homepage');
    if (search) {
      query.where(
        '(homepage.name_vi LIKE :search OR homepage.name_en LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    return CommonPagination(getHomepageAdminDto, query);
  }

  async removeItemHomepage(id: string) {
    try {
      const post = await this.homepageRepository.findOne({
        where: {
          id,
        },
      });
      if (!post) {
        throw new NotFoundException('Item homepage not found');
      }
      await this.homepageRepository.delete(id);
    } catch (error) {
      if (error?.response) {
        throw new BadRequestException(error.response);
      }
      throw new BadRequestException(
        'The Item homepage has been used in a location that cannot be deleted',
      );
    }
  }
}
