import pdf, { Result } from 'pdf-parse';
import * as fs from 'fs';

export class PdfProcessor {
  private data: Result | null = null;

  public async processPdf(filePath: string): Promise<void> {
    const pdfBuffer = fs.readFileSync(filePath);

    this.data = await pdf(pdfBuffer);
  }

  public extractAmount(): number | null {
    if (!this.data) return null;

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
    
    const identifierPatterns = [
      /Número de identificador\s*(\d+)/,
      /Número de referencia\s*(\d+)/
    ];

    for (const pattern of identifierPatterns) {
      const identifierMatch = this.data.text.match(pattern);
      
      if (identifierMatch) {
        return parseInt(identifierMatch[1]).toString();
      }
    }

    return null;
  }

  public extractCuit(): string | null {
    if (!this.data) return null;
    
    const cuitPattern = /CUIT destinatario\s*(\d+)/;
    const cuitMatch = this.data.text.match(cuitPattern);
    return cuitMatch ? cuitMatch[1] : null;
  }
}
