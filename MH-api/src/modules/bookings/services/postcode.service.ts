import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CommonError,
  CommonResponse,
} from 'src/common/constants/common.constants';
import { PostcodeDataService } from '../../postcode-data/services/postcode-data.service';
import {
  ICountry,
  ICity,
  ITown,
  IPostCode,
} from '../interface/postcode.interface';
import { PostcodeDataService } from '../../postcode-data/services/postcode-data.service';
import { GetPostCodeDto } from '../dto/get-postcode.dto';
import { Repository } from 'typeorm';
import { PostCodeEntity } from '../entities/postcode.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { commonResponse } from 'src/common/helper/common-response';

@Injectable()
export class PostCodeService {
  constructor(
    @InjectRepository(PostCodeEntity)
    private readonly postCodeRepository: Repository<PostCodeEntity>,
    private readonly postcodeDataService: PostcodeDataService,
  ) {}

  async getDataFromGoogleSheet(): Promise<string[][]> {
    try {
      // Use local data service instead of Google Sheets API
      return await this.postcodeDataService.getPostcodeData();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error reading postcode data:',
        error,
      );
    }
  }

  mappingDataPostCode(data: string[][]): ICountry[] {
    const dataLength = data.length;
    const countries: ICountry[] = [];
    let countryIndex: ICountry = null;
    let prefectures: ICity[] = [];
    let towns: ITown[] = [];

    if (dataLength < 2) {
      return [];
    }
    let index = 1;
    while (index < dataLength) {
      if (countryIndex === null && data[index].length === 1) {
        countryIndex = {
          name: data[index][0],
          cities: [],
        };

        // Push index
        index++;
        continue;
      } else if (countryIndex !== null && data[index].length === 5) {
        // mapping prefecture

        // Register first prefectures if empty value
        if (prefectures.length === 0) {
          prefectures.push({
            name: data[index][1],
            towns: [],
          });
        }
        let prefecture: ICity = prefectures[prefectures.length - 1];

        // check new prefecture push into countryIndex
        if (prefecture.name !== data[index][1]) {
          prefecture.towns = towns;

          // register prefecture
          prefecture = {
            name: data[index][1],
            towns: [],
          };
          prefectures.push(prefecture);

          // clear towns
          towns = [];
        }

        // mapping towns
        if (towns.length === 0) {
          towns.push({
            name: data[index][2],
            postcodes: [],
          });
        }

        towns[towns.length - 1].postcodes.push({
          value: data[index][3].trim(),
          displayName: data[index][4],
        });

        //save values towns
        prefecture.towns = towns;

        // Push index
        index++;
        continue;
      } else if (countryIndex !== null && data[index].length === 1) {
        countryIndex.cities = prefectures;

        if (countryIndex.cities.length > 0) countries.push(countryIndex);

        // clear data countryIndex and prefectures
        countryIndex = null;
        prefectures = [];
        towns = [];

        // No push index
        continue;
      }

      break;
    }

    return countries;
  }

  async getPostcodesFromGoogleSheet() {
    const data = await this.getDataFromGoogleSheet();

    return this.mappingDataPostCode(data);
  }

  async getPostcodeInfo(postcode: string, getPostCodeDto: GetPostCodeDto) {
    const { country } = getPostCodeDto;
    let countryIndex = 0;
    let postcodeInfo: IPostCode = null;

    const data = await this.getDataFromGoogleSheet();

    for (let i = 0; i < data.length; i++) {
      if (data[i].length === 1) {
        countryIndex = i;
        continue;
      }

      if (data[i][3] === postcode) {
        if (country && data[countryIndex][0] !== country) {
          continue;
        }

        postcodeInfo = {
          value: data[i][3],
          displayName: data[i][4],
          townName: data[i][2],
          cityName: data[i][1],
          countryName: data[countryIndex][0],
        };
        break;
      }
    }

    return postcodeInfo;
  }

  async getPostcodeInfoV2(postcode: string, getPostCodeDto: GetPostCodeDto) {
    const { country } = getPostCodeDto;

    return this.postCodeRepository.findOne({
      where: {
        value: postcode,
        countryName: country,
      },
    });
  }

  async syncDataFromGoogleSheetToDatabase() {
    let countryIndex = 0;
    let postcodeInfo: IPostCode = null;
    const data = await this.getDataFromGoogleSheet();

    for (let i = 0; i < data.length; i++) {
      if (data[i].length === 1) {
        countryIndex = i;
        continue;
      }

      // Skip if row doesn't have enough columns for postcode data
      if (data[i].length < 5) continue;

      postcodeInfo = {
        value: data[i][3],
        displayName: data[i][4],
        townName: data[i][2],
        cityName: data[i][1],
        countryName: data[countryIndex][0],
      };

      const checkExists = await this.postCodeRepository.findOne({
        where: {
          value: postcodeInfo.value,
        },
      });
      if (!checkExists) {
        await this.postCodeRepository.save(postcodeInfo);
      }
    }

    return commonResponse(CommonResponse.SUCCESS, null);
  }
}
