import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { ItemInput } from './dto/item-input.dto.js';

const COLUMNS = 'id, name, description, created_at, updated_at';

@Injectable()
export class ItemsService {
  constructor(private readonly db: DatabaseService) {}

  async list(limit: number, offset: number) {
    const { rows } = await this.db.pool.query(
      `SELECT ${COLUMNS} FROM items ORDER BY id LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return rows;
  }

  async get(id: number) {
    const { rows } = await this.db.pool.query(`SELECT ${COLUMNS} FROM items WHERE id = $1`, [id]);
    if (!rows[0]) throw new NotFoundException('Item not found');
    return rows[0];
  }

  async create(item: ItemInput) {
    const { rows } = await this.db.pool.query(
      `INSERT INTO items (name, description) VALUES ($1, $2) RETURNING ${COLUMNS}`,
      [item.name, item.description ?? null],
    );
    return rows[0];
  }

  async update(id: number, item: ItemInput) {
    const { rows } = await this.db.pool.query(
      `UPDATE items SET name = $1, description = $2, updated_at = now()
       WHERE id = $3 RETURNING ${COLUMNS}`,
      [item.name, item.description ?? null, id],
    );
    if (!rows[0]) throw new NotFoundException('Item not found');
    return rows[0];
  }

  async remove(id: number) {
    const { rowCount } = await this.db.pool.query('DELETE FROM items WHERE id = $1', [id]);
    if (!rowCount) throw new NotFoundException('Item not found');
  }
}
