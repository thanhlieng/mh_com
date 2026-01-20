import { BadRequestException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { commonRadix } from '../constants/common.constants';
import { CommonPaginationDto } from '../dto/pagination.dto';
import { ResponsePagination } from '../dto/response-pagination.dto';

/**
 * Generate response for paginate get endpoint.
 * @param commonPaginationDto CommonPaginationDto
 * @param query SelectQueryBuilder
 */
export async function CommonPagination<T>(
  commonPaginationDto: CommonPaginationDto,
  query: SelectQueryBuilder<T>,
): Promise<ResponsePagination<T>> {
  const page = parseInt(commonPaginationDto.page, commonRadix) - 1;
  const pageSize = parseInt(commonPaginationDto.pageSize, commonRadix);
  if (page < 0 || pageSize < 1) {
    throw new BadRequestException();
  }
  const [result, totalCount] = await query
    .take(pageSize)
    .skip(page * pageSize)
    .getManyAndCount();
  return {
    data: result,
    pagination: {
      currentPage: page + 1,
      pageSize,
      totalPage: Math.ceil(totalCount / pageSize),
      totalCount,
    },
  };
}

export async function CommonPaginationRaw<T>(
  commonPaginationDto: CommonPaginationDto,
  query: SelectQueryBuilder<T>,
  totalRecord?: number
): Promise<ResponsePagination<T>> {
  const page = parseInt(commonPaginationDto.page, commonRadix) - 1;
  const pageSize = parseInt(commonPaginationDto.pageSize, commonRadix);
  if (page < 0 || pageSize < 1) {
    throw new BadRequestException();
  }
  let result: T[]

  if (totalRecord && totalRecord > 0) {
    result = await query
    .limit(pageSize)
    .offset(page * pageSize)
    .getRawMany()
  } else {
    [result, totalRecord] = await Promise.all([
      query
        .limit(pageSize)
        .offset(page * pageSize)
        .getRawMany(),
      query.getCount(),
    ]);
  }

  return {
    data: result,
    pagination: {
      currentPage: page + 1,
      pageSize,
      totalPage: Math.ceil(totalRecord / pageSize),
      totalCount: totalRecord ?? 0,
    },
  };
}
