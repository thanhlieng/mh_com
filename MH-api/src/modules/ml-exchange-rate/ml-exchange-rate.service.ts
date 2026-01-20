import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MLExchangeRateEntity } from './entities/ml-exchange-rate.entity';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { MLExchangeRateRepository } from './ml-exchange-rate.repository';
import { DefaultTimezone } from '@constants/common.constants';

@Injectable()
export class MlExchangeRateService {
  constructor(private readonly mlExchangeRateRepository: MLExchangeRateRepository) {}

  // Create a new exchange rate
  async create(createDto: Partial<MLExchangeRateEntity>): Promise<MLExchangeRateEntity> {
    createDto.fromCurrency = createDto.fromCurrency || 'USD';
    createDto.toCurrency = createDto.toCurrency || 'VND';

    if (createDto.timeApplyFrom > createDto.timeApplyTo) {
      throw new BadRequestException(
        'Thời gian bắt đầu áp dụng tỷ giá không thể lớn hơn thời gian kết thúc áp dụng tỷ giá',
      );
    }

    createDto.timeApplyFrom = dayjs(createDto.timeApplyFrom).tz(DefaultTimezone).startOf('day').toDate();
    createDto.timeApplyTo = dayjs(createDto.timeApplyTo).tz(DefaultTimezone).endOf('day').toDate();

    const checkTimeRangeExist = await this.mlExchangeRateRepository
      .createQueryBuilder('exchange_rate')
      .where('exchange_rate.fromCurrency = :fromCurrency', { fromCurrency: createDto.fromCurrency })
      .andWhere('exchange_rate.toCurrency = :toCurrency', { toCurrency: createDto.toCurrency })
      .andWhere(
        `(
          (time_apply_from <= :timeApplyFrom AND time_apply_to >= :timeApplyFrom) or 
          (time_apply_from <= :timeApplyTo AND time_apply_to >= :timeApplyTo) or
          (time_apply_from >= :timeApplyFrom AND time_apply_from <= :timeApplyTo) or
          (time_apply_to >= :timeApplyFrom AND time_apply_to <= :timeApplyTo)
        )`,
        {
          timeApplyFrom: createDto.timeApplyFrom,
          timeApplyTo: createDto.timeApplyTo,
        },
      )
      .getOne();
    if (checkTimeRangeExist) {
      throw new BadRequestException(
        `Thời gian áp dụng tỷ giá đã tồn tại với khoảng thời gian từ ${dayjs(checkTimeRangeExist.timeApplyFrom)
          .tz(DefaultTimezone)
          .format('DD/MM/YYYY')} đến ${dayjs(checkTimeRangeExist.timeApplyTo)
          .tz(DefaultTimezone)
          .format('DD/MM/YYYY')}. Vui lòng kiểm tra lại`,
      );
    }

    const exchangeRate = this.mlExchangeRateRepository.create(createDto);
    return this.mlExchangeRateRepository.save(exchangeRate);
  }

  // Get all exchange rates
  async findAll(): Promise<MLExchangeRateEntity[]> {
    return this.mlExchangeRateRepository.find({
      order: {
        timeApplyFrom: 'DESC',
      },
    });
  }

  // Get an exchange rate by ID
  async findOne(id: string): Promise<MLExchangeRateEntity> {
    const exchangeRate = await this.mlExchangeRateRepository.findOne({
      where: {
        id,
      },
    });
    if (!exchangeRate) {
      throw new NotFoundException(`Exchange rate with ID ${id} not found`);
    }
    return exchangeRate;
  }

  // Update an exchange rate by ID
  async update(id: string, updateDto: Partial<MLExchangeRateEntity>): Promise<MLExchangeRateEntity> {
    updateDto.fromCurrency = updateDto.fromCurrency || 'USD';
    updateDto.toCurrency = updateDto.toCurrency || 'VND';

    if (updateDto.timeApplyFrom > updateDto.timeApplyTo) {
      throw new BadRequestException(
        'Thời gian bắt đầu áp dụng tỷ giá không thể lớn hơn thời gian kết thúc áp dụng tỷ giá',
      );
    }
    updateDto.timeApplyFrom = dayjs(updateDto.timeApplyFrom).tz(DefaultTimezone).startOf('day').toDate();
    updateDto.timeApplyTo = dayjs(updateDto.timeApplyTo).tz(DefaultTimezone).endOf('day').toDate();

    const checkTimeRangeExist = await this.mlExchangeRateRepository
      .createQueryBuilder('exchange_rate')
      .where('exchange_rate.fromCurrency = :fromCurrency', { fromCurrency: updateDto.fromCurrency })
      .andWhere('exchange_rate.toCurrency = :toCurrency', { toCurrency: updateDto.toCurrency })
      .andWhere('exchange_rate.id != :id', { id })
      .andWhere(
        `(
        (time_apply_from <= :timeApplyFrom AND time_apply_to >= :timeApplyFrom) OR 
        (time_apply_from <= :timeApplyTo AND time_apply_to >= :timeApplyTo) OR
        (time_apply_from >= :timeApplyFrom AND time_apply_from <= :timeApplyTo) OR
        (time_apply_to >= :timeApplyFrom AND time_apply_to <= :timeApplyTo)
      )`,
        {
          timeApplyFrom: updateDto.timeApplyFrom,
          timeApplyTo: updateDto.timeApplyTo,
        },
      )
      .getOne();

    if (checkTimeRangeExist) {
      throw new BadRequestException(
        `Thời gian áp dụng tỷ giá đã tồn tại với khoảng thời gian từ ${dayjs(checkTimeRangeExist.timeApplyFrom)
          .tz(DefaultTimezone)
          .format('DD/MM/YYYY')} đến ${dayjs(checkTimeRangeExist.timeApplyTo)
          .tz(DefaultTimezone)
          .format('DD/MM/YYYY')}. Vui lòng kiểm tra lại`,
      );
    }

    await this.mlExchangeRateRepository.update(id, updateDto);
    const updatedExchangeRate = await this.mlExchangeRateRepository.findOne({
      where: {
        id,
      },
    });
    if (!updatedExchangeRate) {
      throw new NotFoundException(`Exchange rate with ID ${id} not found`);
    }
    return updatedExchangeRate;
  }

  // Delete an exchange rate by ID
  async remove(id: string): Promise<void> {
    const checkFinanceStatisticExist = await this.mlExchangeRateRepository
      .createQueryBuilder('exchange_rate')
      .innerJoin('finance_cpn', 'fc', 'fc.exchange_rate_id = exchange_rate.id')
      .innerJoin('pu_deliveries', 'pd', 'pd.booking_id = fc.booking_id')
      .innerJoin('connect_bill', 'cb', 'cb.id = pd.connect_bill_id')
      .select(['cb.created_at as checkout_date'])
      .getRawOne();

    if (checkFinanceStatisticExist) {
      throw new BadRequestException(
        `Không thể xóa tỷ giá này vì đã được sử dụng trong đơn hàng được checkout ngày ${dayjs(
          checkFinanceStatisticExist.checkout_date,
        )
          .tz(DefaultTimezone)
          .format('DD/MM/YYYY')}. Vui lòng kiểm tra lại`,
      );
    }

    const result = await this.mlExchangeRateRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Exchange rate with ID ${id} not found`);
    }
  }
}
