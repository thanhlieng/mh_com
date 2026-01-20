import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonLogger } from '../logger/common-logger';

@Injectable()
export class NewrelicInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logger = new CommonLogger('Main');
    const startTime = Date.now();
    const req = context.switchToHttp().getRequest();
    const [url, method] = [req.url, req.method];

    return next.handle().pipe(
      tap(() => {
        const data = `[${method}] : ${url} ${Date.now() - startTime}ms`;
        logger.log(data);
      }),
    );
  }
}
