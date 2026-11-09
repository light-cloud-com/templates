import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

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

export class ListQuery {
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;
}
