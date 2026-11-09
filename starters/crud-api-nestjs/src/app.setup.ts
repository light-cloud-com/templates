import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JsonErrorFilter } from './common/filters/json-error.filter.js';

// What main.ts applies to the app, shared with the tests so they run the same app.
export function configureApp(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new JsonErrorFilter());
  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('CRUD API').build()),
  );
  // Light Cloud (Cloud Run) sends SIGTERM before stopping an instance; this
  // closes the server and the database pool cleanly.
  app.enableShutdownHooks();
  return app;
}
