import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PostcodeDataService } from '../services/postcode-data.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Postcode Data')
@Controller('postcode-data')
export class PostcodeDataController {
  constructor(private readonly postcodeDataService: PostcodeDataService) {}

  @Get('export')
  @ApiOperation({ summary: 'Export postcode data as CSV' })
  @ApiResponse({ status: 200, description: 'Postcode data exported successfully' })
  async exportPostcodeData(@Res() res: Response) {
    try {
      const buffer = await this.postcodeDataService.exportPostcodeData();
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="postcode_data_${Date.now()}.csv"`,
      );
      
      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        message: 'Error exporting postcode data',
        error: error.message,
      });
    }
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import postcode data from CSV/Excel file' })
  @ApiResponse({ status: 200, description: 'Postcode data imported successfully' })
  @HttpCode(HttpStatus.OK)
  async importPostcodeData(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      // Parse the uploaded file
      const xlsx = require('node-xlsx');
      const [{ data }] = xlsx.parse(file.buffer, {
        type: 'string',
      });

      await this.postcodeDataService.importPostcodeData(data);

      return {
        message: 'Postcode data imported successfully',
        rowsImported: data.length,
      };
    } catch (error) {
      return {
        message: 'Error importing postcode data',
        error: error.message,
      };
    }
  }

  @Get('sync')
  @ApiOperation({ summary: 'Sync postcode data' })
  @ApiResponse({ status: 200, description: 'Postcode data synchronized successfully' })
  @HttpCode(HttpStatus.OK)
  async syncPostcodeData() {
    try {
      const result = await this.postcodeDataService.syncPostcodeData();
      return result;
    } catch (error) {
      return {
        message: 'Error syncing postcode data',
        error: error.message,
      };
    }
  }

  @Get('data')
  @ApiOperation({ summary: 'Get postcode data' })
  @ApiResponse({ status: 200, description: 'Postcode data retrieved successfully' })
  async getPostcodeData() {
    try {
      const data = await this.postcodeDataService.getPostcodeData();
      return {
        data,
        totalRows: data.length,
      };
    } catch (error) {
      return {
        message: 'Error retrieving postcode data',
        error: error.message,
      };
    }
  }
}