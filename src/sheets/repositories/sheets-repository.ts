import { SheetPattern } from '@prisma/client';
import { CreateSheetPatternDto } from '../dtos/sheet-pattern';

export abstract class SheetsRepository {
  abstract get(): Promise<SheetPattern[]>;
  abstract create(pattern: CreateSheetPatternDto): Promise<SheetPattern>;
  abstract check(file: Express.Multer.File, patternId: string): Promise<any>;
}
