import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from '../entities/categories.entity';
import { Repository } from 'typeorm';
import { ItemCategoryEntity } from '../entities/item-categories.entity';
import { ICategory } from '../interfaces/categories.interface';
import { IItemCategory } from '../interfaces/item-categories.interface';
import { GetItemCategoryDto } from '../dto/get-item-categories.dto';
import { CreateItemCategoryDto } from '../dto/create-item-category.dto';
import { ECategoryMessage } from '../categories.constant';
import { UpdateItemCategoryDto } from '../dto/update-item-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,

    @InjectRepository(ItemCategoryEntity)
    private readonly itemCategoryRepository: Repository<ItemCategoryEntity>,
  ) {}

  async initCategories(categories: ICategory[]) {
    for (let i = 0; i < categories.length; i++) {
      let category = await this.categoryRepository.findOne({
        where: {
          key: categories[i].key,
        },
      });
      if (category) {
        continue;
      }
      category = await this.categoryRepository.save({
        name: categories[i].name,
        key: categories[i].key,
      });

      const itemCategories = categories[i].items.map(
        (item): IItemCategory => ({
          categoryId: category.id,
          name: item.name,
          isDefault: item?.isDefault,
          key: item?.key,
        }),
      );
      await this.itemCategoryRepository.save(itemCategories);
    }

    console.log('========== INIT CATEGORY SUCCESS =================');
  }

  async createItemCategory(createItemCategoryDto: CreateItemCategoryDto) {
    const { categoryKey, name, key } = createItemCategoryDto;

    const category = await this.categoryRepository.findOne({
      where: {
        key: categoryKey,
      },
    });
    if (!category) {
      throw new HttpException(
        ECategoryMessage.CATEGORY_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.itemCategoryRepository.save({
      categoryId: category.id,
      name: name,
      key: key,
    });
  }

  async updateItemCategory(
    id: string,
    updateItemCategoryDto: UpdateItemCategoryDto,
  ) {
    const checkExists = await this.itemCategoryRepository.findOneBy({ id });
    if (!checkExists) {
      throw new HttpException(
        ECategoryMessage.ITEM_CATEOGRY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (checkExists.key) {
      throw new HttpException(
        ECategoryMessage.ITEM_CATEGORY_CANNOT_REMOVE_OR_UPDATE,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.itemCategoryRepository.update(
      {
        id: id,
      },
      {
        name: updateItemCategoryDto.name,
        key: updateItemCategoryDto.key,
      },
    );
  }

  async removeItemCategory(id: string) {
    const checkExists = await this.itemCategoryRepository.findOneBy({ id });
    if (!checkExists) {
      throw new HttpException(
        ECategoryMessage.ITEM_CATEOGRY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (checkExists.key) {
      throw new HttpException(
        ECategoryMessage.ITEM_CATEGORY_CANNOT_REMOVE_OR_UPDATE,
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      return this.itemCategoryRepository.delete(checkExists.id);
    } catch (error) {
      throw new HttpException(
        'Lựa chọn này đã được sử dụng trong hệ thống! Không thể xóa !',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getItemCategories(getItemCategoriesDto: GetItemCategoryDto) {
    const { key } = getItemCategoriesDto;

    const query = this.itemCategoryRepository
      .createQueryBuilder('item_categories')
      .leftJoin(
        'categories',
        'categories',
        'categories.id = item_categories.category_id',
      )
      .where('categories.key = :key', {
        key: key,
      });

    return query.getMany();
  }
}
