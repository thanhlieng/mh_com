import {
  Injectable,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { SystemBJwtService } from '../auth/system-b-jwt.service';

interface CallSystemAOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string; // e.g., "/api/bangke", "/api/services"
  data?: any;
  a_supplier_id?: string; // supplier token
  a_customer_id?: string; // customer token
  timeout?: number; // Default: 10000ms
}

@Injectable()
export class SystemAIntegrationService {
  private baseUrl: string;
  private requestTimeout: number = 10000;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private systemBJwtService: SystemBJwtService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'SYSTEM_A_API_BASE_URL',
      'http://localhost:8000',
    );
  }

  /**
   * Call System A API with automatic token injection
   * @param options - Call options
   * @returns Response data from System A
   * @throws HttpException with appropriate status code if call fails
   */
  async callSystemA<T = any>(options: CallSystemAOptions): Promise<T> {
    const {
      method,
      endpoint,
      data,
      a_supplier_id,
      a_customer_id,
      timeout = this.requestTimeout,
    } = options;

    let token: string;

    try {
      if (a_supplier_id) {
        token = this.systemBJwtService.issueSupplierToken(a_supplier_id);
      } else if (a_customer_id) {
        token = this.systemBJwtService.issueCustomerToken(a_customer_id);
      } else {
        token = this.systemBJwtService.issueServiceToken();
      }
    } catch (error) {
      // If token generation fails (e.g., supplier not linked), propagate error
      if (error.status === HttpStatus.CONFLICT) {
        throw error; // Re-throw conflict/409 errors as-is
      }
      throw new InternalServerErrorException(
        'Failed to generate System A token',
      );
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      const config = {
        headers,
        timeout,
      };

      let response;
      switch (method) {
        case 'GET':
          response = await firstValueFrom(
            this.httpService.get<T>(url, config),
          );
          break;
        case 'POST':
          response = await firstValueFrom(
            this.httpService.post<T>(url, data, config),
          );
          break;
        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put<T>(url, data, config),
          );
          break;
        case 'DELETE':
          response = await firstValueFrom(
            this.httpService.delete<T>(url, config),
          );
          break;
        case 'PATCH':
          response = await firstValueFrom(
            this.httpService.patch<T>(url, data, config),
          );
          break;
        default:
          throw new BadRequestException(`Unsupported HTTP method: ${method}`);
      }

      return response.data;
    } catch (error) {
      this.handleError(error, endpoint);
    }
  }

  /**
   * Handle errors from System A API calls
   */
  private handleError(error: any, endpoint: string): never {
    // Handle axios/HTTP errors
    if (error.response) {
      const { status, data } = error.response;

      // A returned an error response
      throw new HttpException(
        {
          statusCode: status,
          message: data?.message || 'Gọi API hệ thống A thất bại',
          systemAError: data,
        },
        status,
      );
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Hệ thống A không phản hồi (timeout)',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      // Connection refused / DNS error
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Hệ thống A không khả dụng',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Unknown error - log and return 500
    console.error(`[SystemAIntegration] Error calling ${endpoint}:`, error);
    throw new InternalServerErrorException(
      'Lỗi khi gọi API hệ thống A',
    );
  }
}
