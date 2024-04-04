import { Module } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SheetsController } from './sheets.controller';
import { SheetsRepository } from './repositories/sheets-repository';
import { SheetsService } from './sheets.service';

@Module({
  controllers: [SheetsController],
  providers: [
    PrismaService,
    { provide: SheetsRepository, useClass: SheetsService },
  ],
})
export class SheetsModule {}
