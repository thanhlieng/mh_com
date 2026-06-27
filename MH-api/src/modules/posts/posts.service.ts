import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonPagination } from 'src/common/helper/common-pagination';
import { In, Not, Repository } from 'typeorm';
import { CreatePostsDto } from './dto/create-posts.dto';
import { GetPostDto } from './dto/search-post.dto';
import { UpdatePostsDto } from './dto/update-posts.dto';
import { PostsEntity } from './entities/posts.entity';
import { CategoriesPostEntity } from './entities/categories-post.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ICategoryPost } from './interfaces/category-post.interface';
import { GetCategoryDto } from './dto/get-category.dto';
import { GetSimilarPostDto } from './dto/get-similar-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,

    @InjectRepository(CategoriesPostEntity)
    private readonly categoriesPostRepository: Repository<CategoriesPostEntity>,
  ) {}

  ////////// seed

  createCategoryPostSeed(input: ICategoryPost[]) {
    return this.categoriesPostRepository.save(input);
  }
  /////////

  create(createPostsDto: CreatePostsDto) {
    return this.postsRepository.save(createPostsDto);
  }

  createCategoryPost(createCategoryDto: CreateCategoryDto) {
    return this.categoriesPostRepository.save(createCategoryDto);
  }

  async findAllCategory(getCategoryDto: GetCategoryDto) {
    const { search } = getCategoryDto;
    const query = this.categoriesPostRepository.createQueryBuilder('category');
    if (search) {
      query.where(
        '(LOWER(category.name_vi) LIKE :search OR LOWER(category.name_en) LIKE :search)',
        {
          search: `%${search}%`.toLowerCase(),
        },
      );
    }

    query.addOrderBy('category.created_at', 'DESC');

    return CommonPagination(getCategoryDto, query);
  }

  async findAll(getPostDto: GetPostDto) {
    const { search } = getPostDto;

    const query = this.postsRepository.createQueryBuilder('post');
    if (search) {
      query.where(
        `(post.title_vi LIKE :search OR post.title_en LIKE :search OR post.description_vi LIKE :search OR post.description_en LIKE :search)`,
        {
          search: `%${search}%`,
        },
      );
    }
    query.addOrderBy('post.created_at', 'DESC');

    return CommonPagination(getPostDto, query);
  }

  async findOne(id: string) {
    const result = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndMapOne(
        'post.category',
        'categories_post',
        'category',
        'category.id = post.category_id',
      )
      .where('post.id = :id', {
        id,
      })
      .getOne();
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async findCategoryDetail(id: string) {
    const query = this.categoriesPostRepository
      .createQueryBuilder('category')
      .leftJoinAndMapMany(
        'category.posts',
        'posts',
        'posts',
        'category.id = posts.category_id',
      )
      .where('category.id = :id', {
        id,
      });

    const result = await query.getOne();
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async getSimilarPosts(id: string, getSimilarPostDto: GetSimilarPostDto) {
    const { limit } = getSimilarPostDto;
    const post = await this.findOne(id);
    let postsSimilar1 = [];
    let postsSimilar2 = [];
    let idExists = [id];

    postsSimilar1 = await this.postsRepository.find({
      where: {
        categoryId: post.categoryId,
        id: Not(In(idExists)),
      },
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
    if (postsSimilar1.length < limit) {
      idExists = [...idExists, ...postsSimilar1.map((post) => post.id)];
      postsSimilar2 = await this.postsRepository.find({
        where: {
          id: Not(In(idExists)),
        },
        order: {
          createdAt: 'DESC',
        },
      });
    }

    return [...postsSimilar1, ...postsSimilar2];
  }

  update(id: string, updatePostsDto: UpdatePostsDto) {
    return this.postsRepository.update(id, updatePostsDto);
  }

  updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesPostRepository.update(id, updateCategoryDto);
  }

  async removePost(id: string) {
    try {
      const post = await this.postsRepository.findOne({
        where: {
          id,
        },
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      await this.postsRepository.delete(id);
    } catch (error) {
      if (error?.response) {
        throw new BadRequestException(error.response);
      }
      throw new BadRequestException(
        'The post has been used in a location that cannot be deleted',
      );
    }
  }

  async removeCategoryPost(id: string) {
    try {
      const categoryPost = await this.categoriesPostRepository.findOne({
        where: {
          id,
        },
      });
      if (!categoryPost) {
        throw new NotFoundException('Category not found');
      }
      await this.categoriesPostRepository.delete(id);
    } catch (error) {
      if (error?.response) {
        throw new BadRequestException(error.response);
      }
      throw new BadRequestException(
        'The category post has been used in a location that cannot be deleted',
      );
    }
  }
}
