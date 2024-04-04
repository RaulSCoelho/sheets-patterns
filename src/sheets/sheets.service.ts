import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { SheetsRepository } from './repositories/sheets-repository';
import { CreateSheetPatternDto } from './dtos/sheet-pattern';
import { SheetPattern } from '@prisma/client';
import * as xlsx from 'xlsx';

@Injectable()
export class SheetsService implements SheetsRepository {
  constructor(private prisma: PrismaService) {}

  async get(): Promise<SheetPattern[]> {
    return await this.prisma.sheetPattern.findMany({
      include: {
        columns: { include: { rules: { include: { allowedValues: true } } } },
      },
    });
  }

  async create(pattern: CreateSheetPatternDto): Promise<SheetPattern> {
    return await this.prisma.sheetPattern.create({
      include: {
        columns: {
          include: { rules: { include: { allowedValues: true } } },
        },
      },
      data: {
        name: pattern.name,
        columns: {
          create: pattern.columns.map(({ name, dataType, rules }) => ({
            name,
            dataType,
            rules: { create: rules },
          })),
        },
      },
    });
  }

  async check(file: Express.Multer.File, patternId: string): Promise<any> {
    const pattern = await this.prisma.sheetPattern.findUnique({
      where: { id: patternId },
      include: {
        columns: { include: { rules: { include: { allowedValues: true } } } },
      },
    });
    // Parse Excel file buffer
    const workbook = xlsx.read(file.buffer);
    // Assuming you want to validate only the first sheet in the workbook
    const sheet = workbook.Sheets[workbook.SheetNames[1]];
    // Extract data from Excel sheet
    const sheetData: Record<string, string | number | boolean>[] = xlsx.utils.sheet_to_json(sheet);
    const sheetColumns = Object.keys(sheetData[0]).map(col => col.trim());

    // Check if number of columns in sheet matches number of columns in pattern
    if (pattern.columns.length !== sheetColumns.length) {
      return { status: 'failed', reason: 'Number of columns in sheet does not match pattern', errors: [] };
    }

    // Check if all columns in sheet are present in pattern
    if (pattern.columns.some(col => !sheetColumns.includes(col.name.trim()))) {
      return { status: 'failed', reason: 'Column names in sheet do not match pattern', errors: [] };
    }

    const errors: any[] = [];
    // Check each line of sheet data against pattern rules
    for (let i = 0; i < sheetData.length; i++) {
      const line = sheetData[i];
      const lineErrors = { line: i + 1 };

      for (const col of Object.keys(line)) {
        const value = line[col];
        const colPattern = pattern.columns.find(c => c.name.trim() === col.trim());
        lineErrors[colPattern.name] = [];

        switch (colPattern.dataType) {
          case 'text':
            if (typeof value !== 'string') {
              lineErrors[colPattern.name].push(`${colPattern.name} must be a string`);
            } else {
              if (colPattern.rules.maxLength && value.length > colPattern.rules.maxLength) {
                lineErrors[colPattern.name].push(
                  `${colPattern.name} must be at most ${colPattern.rules.maxLength} characters long`,
                );
              }
              if (colPattern.rules.minLength && value.length < colPattern.rules.minLength) {
                lineErrors[colPattern.name].push(
                  `${colPattern.name} must be at least ${colPattern.rules.minLength} characters long`,
                );
              }
            }
            break;
          case 'number':
            if (typeof value !== 'number') {
              lineErrors[colPattern.name].push(`${colPattern.name} must be a number`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              lineErrors[colPattern.name].push(`${colPattern.name} must be a boolean`);
            }
            break;
          case 'date':
            if (!Date.parse(value as string)) {
              lineErrors[colPattern.name].push(`${colPattern.name} must be a valid date`);
            }
            break;
          case 'list':
            if (!colPattern.rules.allowedValues.some(v => v.value === (value as string))) {
              lineErrors[colPattern.name].push(
                `${colPattern.name} must be one of ${colPattern.rules.allowedValues.join(', ')}`,
              );
            }
            break;
        }

        if (lineErrors[colPattern.name].length === 0) {
          delete lineErrors[colPattern.name];
        }
      }

      if (Object.keys(lineErrors).length > 1) {
        errors.push(lineErrors);
      }
    }

    if (errors.length) {
      return { status: 'failed', reason: 'Validation errors', errors };
    }

    return { status: 'succeed', reason: 'No validation errors', errors: [] };
  }
}
