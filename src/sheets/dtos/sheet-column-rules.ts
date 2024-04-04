import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional } from 'class-validator';

export class ColumnRulesDto {
  @IsInt()
  @ApiProperty()
  maxLength: number;

  @IsInt()
  @ApiProperty()
  minLength: number;

  @IsOptional()
  @IsArray()
  @ApiProperty()
  allowedValues?: string[];
}
