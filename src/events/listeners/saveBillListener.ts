import { eventBus } from '../eventBus';
import { Bill } from '../../models/Bill';
import { FileUploadData } from '../../interfaces/FileUploadData';
import { PdfProcessor } from '../../services/PdfProcessor';
import { percentageDifference } from '../../utils/percentageDifference';
import * as fs from 'fs';
import { Op } from "sequelize";

eventBus.on('FileUploaded', async (file: FileUploadData, drive_id: string) => {
  try {
    const pdfProcessor = new PdfProcessor();
    await pdfProcessor.processPdf(file.localFilePath);

    await createBillFromPDF(pdfProcessor, file.service.id, file.service.apartment_id, drive_id);
    console.log(`✅ Data saved from: ${file.localFilePath}`);

    // fs.unlinkSync(file.localFilePath);
  } catch (error) {
    console.error(`❌ Error processing file: ${file.localFilePath}`, error);
  }

});


export async function createBillFromPDF(pdfProcessor: PdfProcessor, serviceId: number, apartmentId: number, drive_id: string) {
  const paymentDate = pdfProcessor.extractPaymentDate();
  const transactionNumber = pdfProcessor.extractTransactionNumber();
  const amount = pdfProcessor.extractAmount();
  const latestPayment = await Bill.findOne({
    where: { service_id: serviceId, payment_date: { [Op.ne]: null } },
    attributes: ['id', 'amount', 'payment_date'],
    order: [['payment_date', 'DESC']]
  });

  const increase_rate = latestPayment ? percentageDifference(Number(latestPayment.amount), amount!) : 0;

  await Bill.create({
    amount: amount,
    transaction_number: transactionNumber,
    payment_date: paymentDate,
    service_id: serviceId,
    apartment_id: apartmentId,
    drive_id: drive_id,
    increase_rate: increase_rate,
  });
}