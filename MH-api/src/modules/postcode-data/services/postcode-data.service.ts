import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse as parseCSV } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export interface ICountry {
  name: string;
  cities: ICity[];
}

export interface ICity {
  name: string;
  towns: ITown[];
}

export interface ITown {
  name: string;
  postcodes: IPostCode[];
}

export interface IPostCode {
  value: string;
  displayName: string;
  townName: string;
  cityName: string;
  countryName: string;
}

export interface PostcodeData {
  data: string[][];
}

@Injectable()
export class PostcodeDataService {
  private readonly dataPath: string;
  private readonly filePath: string;

  constructor() {
    this.dataPath = process.env.POSTCODE_DATA_PATH || './data';
    this.filePath = join(this.dataPath, 'postcode.csv');
  }

  /**
   * Read postcode data from local CSV file instead of Google Sheets
   */
  async getDataFromLocalFile(): Promise<string[][]> {
    try {
      // Check if file exists, if not create sample data
      if (!existsSync(this.filePath)) {
        await this.createSampleData();
      }

      const fileContent = readFileSync(this.filePath, 'utf-8');
      const records = parseCSV(fileContent);
      
      return records;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error reading postcode data from local file:',
        error,
      );
    }
  }

  /**
   * Create sample postcode data if file doesn't exist
   */
  private async createSampleData(): Promise<void> {
    try {
      const sampleData = [
        ['Japan'],
        ['Japan', 'Tokyo', 'Shibuya', '150-0001', 'Shibuya'],
        ['Japan', 'Tokyo', 'Shinjuku', '160-0022', 'Shinjuku'],
        ['Japan', 'Tokyo', 'Chiyoda', '100-0001', 'Chiyoda'],
        ['Japan', 'Osaka', 'Chuo', '542-0076', 'Osaka Chuo'],
        ['Japan', 'Osaka', 'Nishi', '550-0014', 'Osaka Nishi'],
        ['United States'],
        ['USA', 'California', 'Los Angeles', '90210', 'Beverly Hills'],
        ['USA', 'California', 'San Francisco', '94102', 'San Francisco'],
        ['USA', 'New York', 'New York', '10001', 'New York City'],
        ['Vietnam'],
        ['Vietnam', 'Ho Chi Minh', 'District 1', '700000', 'Quan 1'],
        ['Vietnam', 'Ho Chi Minh', 'District 3', '730000', 'Quan 3'],
        ['Vietnam', 'Hanoi', 'Ba Dinh', '100000', 'Ba Dinh'],
      ];

      const csvContent = stringify(sampleData);
      writeFileSync(this.filePath, csvContent, 'utf-8');
      
      // Create data directory if it doesn't exist
      if (!existsSync(this.dataPath)) {
        require('fs').mkdirSync(this.dataPath, { recursive: true });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating sample postcode data:',
        error,
      );
    }
  }

  /**
   * Import postcode data from uploaded Excel/CSV file
   */
  async importPostcodeData(data: string[][]): Promise<void> {
    try {
      const csvContent = stringify(data);
      writeFileSync(this.filePath, csvContent, 'utf-8');
    } catch (error) {
      throw new InternalServerErrorException(
        'Error importing postcode data:',
        error,
      );
    }
  }

  /**
   * Export postcode data as CSV
   */
  async exportPostcodeData(): Promise<Buffer> {
    try {
      const data = await this.getDataFromLocalFile();
      const csvContent = stringify(data);
      return Buffer.from(csvContent, 'utf-8');
    } catch (error) {
      throw new InternalServerErrorException(
        'Error exporting postcode data:',
        error,
      );
    }
  }

  /**
   * Get postcode data formatted like Google Sheets response
   */
  async getPostcodeData(): Promise<string[][]> {
    return this.getDataFromLocalFile();
  }

  /**
   * Sync from external data source (replace Google Sheets sync)
   */
  async syncPostcodeData(externalData?: string[][]): Promise<{ message: string }> {
    try {
      if (externalData && externalData.length > 0) {
        await this.importPostcodeData(externalData);
      } else {
        // Ensure data file exists
        if (!existsSync(this.filePath)) {
          await this.createSampleData();
        }
      }
      
      return { message: 'Postcode data synchronized successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error syncing postcode data:',
        error,
      );
    }
  }
}