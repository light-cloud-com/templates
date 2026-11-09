import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length } from 'class-validator';

export class ItemInput {
  @ApiProperty({ minLength: 1, maxLength: 200, example: 'First item' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Hello' })
  @IsOptional()
  @IsString()
  description?: string | null;
}
