import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ItemInput } from './dto/item-input.dto.js';
import { ListQuery } from './dto/list-query.dto.js';
import { ItemIdPipe } from './item-id.pipe.js';
import { ItemsService } from './items.service.js';

@Controller('items')
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Get()
  list(@Query() query: ListQuery) {
    return this.items.list(query.limit, query.offset);
  }

  @Get(':id')
  get(@Param('id', ItemIdPipe) id: number) {
    return this.items.get(id);
  }

  @Post()
  create(@Body() item: ItemInput) {
    return this.items.create(item);
  }

  @Put(':id')
  update(@Param('id', ItemIdPipe) id: number, @Body() item: ItemInput) {
    return this.items.update(id, item);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ItemIdPipe) id: number) {
    return this.items.remove(id);
  }
}
