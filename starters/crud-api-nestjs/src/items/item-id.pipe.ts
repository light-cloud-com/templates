import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

// Unknown or impossible ids (not a whole number, beyond the 32-bit SERIAL) are 404.
@Injectable()
export class ItemIdPipe implements PipeTransform<string, number> {
  transform(id: string): number {
    const n = Number(id);
    if (!/^\d+$/.test(id) || n < 1 || n > 2147483647) throw new NotFoundException('Item not found');
    return n;
  }
}
