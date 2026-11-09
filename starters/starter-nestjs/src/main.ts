import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Light Cloud (Cloud Run) sends SIGTERM before stopping an instance; this
  // lets Nest run its shutdown hooks and close the server cleanly.
  app.enableShutdownHooks();
  await app.listen(config.port);
}
void bootstrap();
