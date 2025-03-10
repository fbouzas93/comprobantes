import { FileUploadData } from "../interfaces/FileUploadData";
import { Service } from "../models/Service";
import { ServiceRepository } from "../repositories/ServiceRepository";
import { FileProcessorStrategy } from "./FileProcessorStrategy";
import { PdfProcessor } from "./PdfProcessor";

export class BankTransferProcessor implements FileProcessorStrategy {
    constructor(
        private pdfProcessor: PdfProcessor
    ) { }

    async process(files: string[], directory: string): Promise<FileUploadData[]> {
        const results = await Promise.all(
            files.map(async (transfer) => {
                await this.pdfProcessor.processPdf(`${directory}/${transfer}`);
                const cuit = this.pdfProcessor.extractCuit();
                const service = await Service.findOne({ where: { cuit } });
    
                return service ? { localFilePath: `${directory}/${transfer}`, service } : null;
            })
        );
    
        return results.filter((item): item is FileUploadData => Boolean(item));
    }
}