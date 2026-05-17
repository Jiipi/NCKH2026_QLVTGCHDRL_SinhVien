declare module 'exceljs' {
  export class Workbook {
    addWorksheet(name: string): {
      columns: Array<{ header: string; key: string; width: number }>;
      getRow(index: number): {
        font?: { bold?: boolean };
        fill?: { type: string; pattern: string; fgColor: { argb: string } };
        alignment?: { vertical: string; horizontal: string };
      };
      addRow(data: Record<string, string | number>): void;
    };
    xlsx: {
      writeBuffer(): Promise<Buffer>;
      write(stream: NodeJS.WritableStream): Promise<void>;
    };
  }
}
