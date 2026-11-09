import 'reflect-metadata';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DbService } from './db.service.js';
import { ItemsController } from './items.controller.js';

@Module({ controllers: [ItemsController], providers: [DbService] })
class AppModule {}

// Every error leaves as { "error": "..." }.
@Catch()
class JsonErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<{ status(code: number): { json(body: unknown): void } }>();
    if (!(exception instanceof HttpException)) {
      Logger.error(exception);
      return res.status(500).json({ error: 'Something went wrong' });
    }
    const body = exception.getResponse();
    const message = typeof body === 'string' ? body : (body as { message?: unknown }).message;
    res
      .status(exception.getStatus())
      .json({ error: Array.isArray(message) ? message.join('; ') : String(message ?? exception.message) });
  }
}

const app = await NestFactory.create(AppModule);
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
app.useGlobalFilters(new JsonErrorFilter());
SwaggerModule.setup('docs', app, () =>
  SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('CRUD API').build()),
);
app.enableShutdownHooks();
await app.listen(Number(process.env.PORT) || 8080);
