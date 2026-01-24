import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request } from 'express';
import { ILog } from '../logger/log.interface';
import { CommonLogger } from '../logger/common-logger';
import { formatDate } from '../helper/helper';
// import { sendMessageToEmail } from '../helper/helper'; // Commented out - AWS SES removed
// import { SendEmailRequest } from 'aws-sdk/clients/ses'; // Commented out - AWS SES removed
// import { awsConfig } from 'src/configs/configs.constants'; // Commented out - AWS config removed
import { EFormatDate } from '../constants/common.constants';

@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new CommonLogger('HttpExceptionFilter');

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    // const [url, method] = [request.url, request.method];
    const thisLog: ILog = {
      endpoint: request.path,
      ipAddress:
        request.headers['x-forwarded-for'] || request.connection.remoteAddress,
      method: request.method,
      error: exception,
    };

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      // Email sending commented out - AWS SES removed
      // if (request.hostname !== 'localhost') {
      //   const errorQuery = exception['query'];
      //   const parameters = exception['parameters'];
      //   const message = `Message: ${exception.message}
      // Endpoint: ${request.headers.host + request.url}
      // Method: ${request.method}
      // ${errorQuery ? 'Query: ' + errorQuery : ''}
      // ${parameters ? 'PARAMETERS: ' + parameters : ''}
      //       `;
      //   const params: SendEmailRequest = {
      //     Destination: {
      //       ToAddresses: [awsConfig.emailReceiveError],
      //     },
      //     Message: {
      //       Body: {
      //         Text: {
      //           Charset: 'UTF-8',
      //           Data: message,
      //         },
      //       },
      //       Subject: {
      //         Charset: 'UTF-8',
      //         Data: `[ERROR] - ${
      //           parameters || 'Something wrong'
      //       } - ${formatDate(new Date(), EFormatDate.DD_MM_YYYY_HH_mm)}`,
      //       },
      //     },
      //     Source: awsConfig.emailSend,
      //   };
      //   await sendMessageToEmail(params);
      // }

      this.logger.customError(exception.message, exception.stack, thisLog);
    }

    super.catch(exception, host);
  }
}
