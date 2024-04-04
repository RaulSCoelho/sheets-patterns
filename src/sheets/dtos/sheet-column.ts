import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ColumnRulesDto } from './sheet-column-rules';
import { ApiProperty } from '@nestjs/swagger';

export class SheetColumnDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsEnum(['text', 'number', 'date', 'boolean', 'list'])
  @IsNotEmpty()
  @ApiProperty({ enum: ['text', 'number', 'date', 'boolean', 'list'] })
  dataType: string;

  @ValidateNested()
  @Type(() => ColumnRulesDto)
  @ApiProperty({ type: ColumnRulesDto })
  rules: ColumnRulesDto;
}
