import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { SheetColumnDto } from './sheet-column';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSheetPatternDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SheetColumnDto)
  @ApiProperty({ type: [SheetColumnDto] })
  columns: SheetColumnDto[];
}
