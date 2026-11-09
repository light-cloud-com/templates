import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  index() {
    return {
      name: 'CRUD API (NestJS)',
      routes: [
        'GET /health',
        'GET /items?limit=20&offset=0',
        'GET /items/:id',
        'POST /items',
        'PUT /items/:id',
        'DELETE /items/:id',
        'GET /docs',
      ],
    };
  }
}
