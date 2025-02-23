import pdf, { Result } from 'pdf-parse';
import * as fs from 'fs';

export class PdfProcessor {
  private data: Result | null = null;

  constructor() {}

  public async processPdf(filePath: string): Promise<void> {
    const pdfBuffer = fs.readFileSync(filePath);

    this.data = await pdf(pdfBuffer);
  }

  public extractAmount(): number | null {
    if (!this.data) return null; // Aseguramos que los datos estén cargados

    const amountPattern = /\$\s?([\d\.]+,\d{2})/;
    const amountMatch = this.data.text.match(amountPattern);
    return amountMatch ? parseFloat(amountMatch[1].replace('.', '').replace(',', '.')) : null;
  }

  public extractTransactionNumber(): string | null {
    if (!this.data) return null;
    
    const transactionNumberPattern = /Número de transacción\s*(\d+)/;
    const transactionMatch = this.data.text.match(transactionNumberPattern);
    return transactionMatch ? transactionMatch[1] : null;
  }

  public extractPaymentDate(): Date | null {
    if (!this.data) return null;

    const dateTimePattern = /(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2}):(\d{2})/;
    const match = this.data.text.match(dateTimePattern);

    if (!match) return null;

    const [, day, month, year, hours, minutes, seconds] = match.map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  public extractIdentifierCode(): string | null {
    if (!this.data) return null;

    const identifierPattern = /Número de identificador\s*(\d{16})/;
    const identifierMatch = this.data.text.match(identifierPattern);
    return identifierMatch ? identifierMatch[1] : null;
  }
}
