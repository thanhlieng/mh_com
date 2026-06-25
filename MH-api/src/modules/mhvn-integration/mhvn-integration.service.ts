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
import FormDataNode from 'form-data';
import { MhcomJwtService } from '../auth/mhcom-jwt.service';
import {
  EALinkType,
  EATarget,
} from '../users/entities/user-a-link.entity';
import { ActiveAContext } from 'src/common/guards/active-target.guard';

/**
 * Tham chiếu A active cho mỗi call.
 *
 * - `activeContext`: truyền nguyên context do `ActiveTargetGuard` resolve.
 *   Service sẽ mint supplier/customer token tương ứng accountType, gồm
 *   toàn bộ entityIds dưới dạng claim mảng (`supplier_ids`/`customer_ids`).
 * - `target`: chỉ định target cho call **không cần** account context
 *   (vd `service token` master data). Khi đã có `activeContext`, field
 *   này được bỏ qua (target lấy từ context).
 */
interface CallMhvnOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string; // e.g., "/api/bangke", "/api/services"
  data?: any;
  activeContext?: ActiveAContext;
  target?: EATarget; // bắt buộc khi không có activeContext (service token)
  timeout?: number; // Default: 10000ms
}

interface CallMhvnMultipartOptions {
  endpoint: string;
  form: FormDataNode;
  activeContext?: ActiveAContext;
  target?: EATarget;
  timeout?: number;
}

interface CallMhvnDownloadOptions {
  endpoint: string;
  activeContext?: ActiveAContext;
  target?: EATarget;
  timeout?: number;
}

@Injectable()
export class MhvnIntegrationService {
  private baseUrlByTarget: Record<EATarget, string>;
  private requestTimeout: number = 10000;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private mhcomJwtService: MhcomJwtService,
  ) {
    const mhvnUrl = this.configService.get<string>('MHVN_API_BASE_URL_MHVN');
    const gpUrl = this.configService.get<string>('MHVN_API_BASE_URL_GP');
    const legacyUrl = this.configService.get<string>('MHVN_API_BASE_URL');

    // 2 base URL chắc chắn khác nhau giữa mhvn và gp → KHÔNG silent fallback
    // sang `MHVN_API_BASE_URL` (sẽ route nhầm). Cho phép fallback CHỈ KHI một
    // trong hai chưa cấu hình + có legacy → log cảnh báo qua exception nếu
    // thiếu hoàn toàn.
    const resolvedMhvn = mhvnUrl || legacyUrl;
    const resolvedGp = gpUrl || legacyUrl;

    if (!resolvedMhvn) {
      throw new Error(
        "Missing MHVN_API_BASE_URL_MHVN (and no MHVN_API_BASE_URL fallback) — không thể proxy sang hệ mhvn.",
      );
    }
    if (!resolvedGp) {
      throw new Error(
        "Missing MHVN_API_BASE_URL_GP (and no MHVN_API_BASE_URL fallback) — không thể proxy sang hệ gp.",
      );
    }

    this.baseUrlByTarget = {
      [EATarget.MHVN]: resolvedMhvn,
      [EATarget.GP]: resolvedGp,
    };
  }

  /**
   * Resolve token + base URL cho một call dựa theo activeContext / target.
   */
  private resolveAuth(
    activeContext: ActiveAContext | undefined,
    target: EATarget | undefined,
  ): { token: string; baseUrl: string } {
    try {
      if (activeContext) {
        const effectiveTarget = activeContext.target;
        const baseUrl = this.baseUrlByTarget[effectiveTarget];
        const token =
          activeContext.accountType === EALinkType.SUPPLIER
            ? this.mhcomJwtService.issueSupplierToken(
                activeContext.entityIds,
                effectiveTarget,
              )
            : this.mhcomJwtService.issueCustomerToken(
                activeContext.entityIds,
                effectiveTarget,
              );
        return { token, baseUrl };
      }

      // No activeContext → service token. Cần target tường minh.
      if (!target) {
        throw new BadRequestException(
          "MhvnIntegrationService: cần `activeContext` hoặc `target` (service token).",
        );
      }
      return {
        token: this.mhcomJwtService.issueServiceToken(target),
        baseUrl: this.baseUrlByTarget[target],
      };
    } catch (error) {
      if (error?.status === HttpStatus.CONFLICT || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to generate mhvn token',
      );
    }
  }

  /**
   * Call hệ A (mhvn hoặc gp) với token RS256 và base URL theo target.
   */
  async callMhvn<T = any>(options: CallMhvnOptions): Promise<T> {
    const {
      method,
      endpoint,
      data,
      activeContext,
      target,
      timeout = this.requestTimeout,
    } = options;

    const { token, baseUrl } = this.resolveAuth(activeContext, target);
    const url = `${baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      const config = { headers, timeout };
      let response;
      switch (method) {
        case 'GET':
          response = await firstValueFrom(this.httpService.get<T>(url, config));
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
   * Call multipart (file upload) sang hệ A theo target.
   */
  async callMhvnMultipart<T = any>(
    options: CallMhvnMultipartOptions,
  ): Promise<T> {
    const {
      endpoint,
      form,
      activeContext,
      target,
      timeout = this.requestTimeout,
    } = options;

    const { token, baseUrl } = this.resolveAuth(activeContext, target);
    const url = `${baseUrl}${endpoint}`;
    try {
      // QUAN TRỌNG: phải set Content-Length tường minh. Nếu thiếu, axios/HttpService
      // gửi body dạng "Transfer-Encoding: chunked" → Django/WSGI không đọc được
      // multipart body → request.FILES rỗng → A báo "No file provided".
      const response = await firstValueFrom(
        this.httpService.post<T>(url, form, {
          headers: {
            ...form.getHeaders(),
            'Content-Length': form.getLengthSync(),
            Authorization: `Bearer ${token}`,
          },
          timeout,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, endpoint);
    }
  }

  /**
   * Tải file nhị phân (vd Excel) từ hệ A theo target.
   */
  async callMhvnDownload(options: CallMhvnDownloadOptions): Promise<{
    data: Buffer;
    contentType?: string;
    contentDisposition?: string;
  }> {
    const {
      endpoint,
      activeContext,
      target,
      timeout = this.requestTimeout,
    } = options;

    const { token, baseUrl } = this.resolveAuth(activeContext, target);
    const url = `${baseUrl}${endpoint}`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          timeout,
          responseType: 'arraybuffer',
        }),
      );
      return {
        data: Buffer.from(response.data),
        contentType: response.headers?.['content-type'],
        contentDisposition: response.headers?.['content-disposition'],
      };
    } catch (error) {
      // Lỗi từ A khi responseType=arraybuffer có body là Buffer → parse về
      // JSON để handleError đọc được message.
      if (error?.response?.data instanceof Buffer) {
        try {
          error.response.data = JSON.parse(
            error.response.data.toString('utf8'),
          );
        } catch {
          // giữ nguyên nếu không phải JSON
        }
      }
      this.handleError(error, endpoint);
    }
  }

  /**
   * Handle errors from A API calls
   */
  private handleError(error: any, endpoint: string): never {
    if (error.response) {
      const { status, data } = error.response;
      const mhvnMessage =
        (typeof data === 'string' && data) ||
        data?.detail ||
        data?.error ||
        data?.message ||
        'Gọi API hệ thống A thất bại';
      throw new HttpException(
        {
          statusCode: status,
          message: mhvnMessage,
          mhvnError: data,
        },
        status,
      );
    } else if (error.code === 'ECONNABORTED') {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Hệ thống A không phản hồi (timeout)',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Hệ thống A không khả dụng',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    console.error(`[MhvnIntegration] Error calling ${endpoint}:`, error);
    throw new InternalServerErrorException('Lỗi khi gọi API hệ thống A');
  }
}
