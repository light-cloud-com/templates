import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { ItemsModule } from './items/items.module.js';

@Module({
  imports: [DatabaseModule, HealthModule, ItemsModule],
  controllers: [AppController],
})
export class AppModule {}
