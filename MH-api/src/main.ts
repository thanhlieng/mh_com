import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { NewrelicInterceptor } from './common/interceptor/newrelic.interceptor';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { CommonLogger } from './common/logger/common-logger';
import { appConfig, nodeEnvConfig } from './configs/configs.constants';
import setupSwagger from './swagger';
// require('newrelic');

async function bootstrap() {
  const logger = new CommonLogger('Main');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  setupSwagger(app);
  // if (['develop', 'local'].includes(nodeEnvConfig)) {
  // }
  if (['develop', 'local'].includes(nodeEnvConfig)) {
    //newrelic
    app.useGlobalInterceptors(new NewrelicInterceptor());
  }

  // Use custom exception filter.
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));

  // Use class serializer.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new TransformInterceptor());

  // Use global validation pipe.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }), //{ forbidNonWhitelisted: true, whitelist: true }
  );

  // Enable CORS.
  app.enableCors();

  const port = appConfig.port;
  logger.log(`App is listening on port ${port}`);
  const server = await app.listen(port);
  const timeout = 1000 * 60 * 3;
  server.setTimeout(timeout);
}
bootstrap();
