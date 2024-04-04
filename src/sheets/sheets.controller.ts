import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SheetsRepository } from './repositories/sheets-repository';
import { CreateSheetPatternDto } from './dtos/sheet-pattern';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Sheets')
@Controller('sheets')
export class SheetsController {
  constructor(private sheetsRepository: SheetsRepository) {}

  @Get()
  async get() {
    try {
      return await this.sheetsRepository.get();
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message },
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }

  @Post()
  async create(@Body() data: CreateSheetPatternDto) {
    try {
      return await this.sheetsRepository.create(data);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message },
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }

  @Post('check/:patternId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async check(
    @UploadedFile() file: Express.Multer.File,
    @Param('patternId') patternId: string,
  ) {
    try {
      return await this.sheetsRepository.check(file, patternId);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message },
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }
}
