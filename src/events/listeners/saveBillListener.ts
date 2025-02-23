import { eventBus } from '../eventBus';
import { Bill } from '../../models/Bill';
import { FileUploadData } from '../../interfaces/FileUploadData';
import { PdfProcessor } from '../../services/PdfProcessor';

eventBus.on('FileUploaded', async (file: FileUploadData, drive_id: string) => {
  try {
    const pdfProcessor = new PdfProcessor();
    await pdfProcessor.processPdf(file.localFilePath);

    createBillFromPDF(pdfProcessor, file.service.id, file.service.apartment_id, drive_id);

    console.log(`✅ Data saved from: ${file.localFilePath}`);
  } catch (error) {
    console.error(`❌ Error processing file: ${file.localFilePath}`, error);
  }

});


export async function createBillFromPDF(pdfProcessor: PdfProcessor, serviceId: number, apartmentId: number, drive_id: string) {
  const paymentDate = pdfProcessor.extractPaymentDate();
  const transactionNumber = pdfProcessor.extractTransactionNumber();
  const amount = pdfProcessor.extractAmount();

  console.log(paymentDate, transactionNumber, amount);
  
  await Bill.create({
    amount: amount,
    transaction_number: transactionNumber,
    payment_date: paymentDate,
    service_id: serviceId,
    apartment_id: apartmentId,
    drive_id: drive_id,
  });
}