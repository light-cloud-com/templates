import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service.js';

// Global: every feature module can inject DatabaseService without importing this module.
@Global()
@Module({ providers: [DatabaseService], exports: [DatabaseService] })
export class DatabaseModule {}
