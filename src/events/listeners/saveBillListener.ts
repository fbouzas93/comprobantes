import { eventBus } from '../eventBus';
import * as fs from 'fs';
import pdf from 'pdf-parse';
import { Bill } from '../../models/Bill';
import { FileUploadData } from '../../interfaces/FileUploadData';

eventBus.on('FileUploaded', async (file: FileUploadData) => {
  try {
    const pdfBuffer = fs.readFileSync(file.localFilePath);
    const data = await pdf(pdfBuffer);

    const paymentDate = extractPaymentDate(data);
    const transactionNumber = extractTransactionNumber(data);
    const amount = extractAmount(data);

    console.log(paymentDate, transactionNumber, amount);

    await Bill.create({
      amount: amount,
      transaction_number: transactionNumber,
      payment_date: paymentDate,
      service_id: file.service.id,
      apartment_id: file.service.apartment_id,
    });

    console.log(`✅ Data saved from: ${file.localFilePath}`);
  } catch (error) {
    console.error(`❌ Error processing file: ${file.localFilePath}`, error);
  }

  function extractAmount(data: pdf.Result) {
    const amountPattern = /\$\s?([\d\.]+,\d{2})/;
    const amountMatch = data.text.match(amountPattern);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace('.', '').replace(',', '.')) : null;

    return amount;
  }

  function extractTransactionNumber(data: pdf.Result) {
    const transactionNumberPattern = /Número de transacción\s(\d+)/;
    const transactionMatch = data.text.match(transactionNumberPattern);
    const transactionNumber = transactionMatch ? transactionMatch[1] : null;
    
    return transactionNumber;
  }

  function extractPaymentDate(data: pdf.Result) {
    const dateTimePattern = /(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2}):(\d{2})/;
    const match = data.text.match(dateTimePattern);

    if (!match) return null;

    const [, day, month, year, hours, minutes, seconds] = match.map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds);
    }
});


