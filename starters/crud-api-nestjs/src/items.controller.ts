import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DbService } from './db.service.js';
import { ItemInput, ListQuery } from './items.dto.js';

const COLUMNS = 'id, name, description, created_at, updated_at';

// Unknown or impossible ids (not a whole number, beyond the 32-bit SERIAL) are 404.
function toId(id: string): number {
  const n = Number(id);
  if (!/^\d+$/.test(id) || n < 1 || n > 2147483647) throw new NotFoundException('Item not found');
  return n;
}

@Controller()
export class ItemsController {
  constructor(private readonly db: DbService) {}

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

  @Get('health')
  async health() {
    try {
      await this.db.pool.query('SELECT 1');
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }

  @Get('items')
  async list(@Query() query: ListQuery) {
    const { rows } = await this.db.pool.query(
      `SELECT ${COLUMNS} FROM items ORDER BY id LIMIT $1 OFFSET $2`,
      [query.limit, query.offset],
    );
    return rows;
  }

  @Get('items/:id')
  async get(@Param('id') id: string) {
    const { rows } = await this.db.pool.query(`SELECT ${COLUMNS} FROM items WHERE id = $1`, [toId(id)]);
    if (!rows[0]) throw new NotFoundException('Item not found');
    return rows[0];
  }

  @Post('items')
  async create(@Body() item: ItemInput) {
    const { rows } = await this.db.pool.query(
      `INSERT INTO items (name, description) VALUES ($1, $2) RETURNING ${COLUMNS}`,
      [item.name, item.description ?? null],
    );
    return rows[0];
  }

  @Put('items/:id')
  async update(@Param('id') id: string, @Body() item: ItemInput) {
    const { rows } = await this.db.pool.query(
      `UPDATE items SET name = $1, description = $2, updated_at = now()
       WHERE id = $3 RETURNING ${COLUMNS}`,
      [item.name, item.description ?? null, toId(id)],
    );
    if (!rows[0]) throw new NotFoundException('Item not found');
    return rows[0];
  }

  @Delete('items/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const { rowCount } = await this.db.pool.query('DELETE FROM items WHERE id = $1', [toId(id)]);
    if (!rowCount) throw new NotFoundException('Item not found');
  }
}
