import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslateEntity } from './entities/translate.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TranslateService {
  constructor(
    @InjectRepository(TranslateEntity)
    private readonly translateRepository: Repository<TranslateEntity>,
  ) {}

  async translate(original: string): Promise<string> {
    const translateOriginal = await this.translateRepository.findOne({
      where: {
        original: original,
      },
    });
    if (translateOriginal) return translateOriginal.en;

    return original;
  }
}
