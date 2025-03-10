import * as fs from 'fs';
import { extractIdentifiers } from '../utils/extractIdentifiers';
import { ServiceRepository } from '../repositories/ServiceRepository';
import { FileUploadData } from '../interfaces/FileUploadData';
import { InvoiceProcessor } from './InvoiceProcessor';
import { BankTransferProcessor } from './BankTransferProcessor';
import { FileProcessorStrategy } from './FileProcessorStrategy';
import { PdfProcessor } from './PdfProcessor';

export class FileService {
    private directory: string;
    private serviceRepository: ServiceRepository;

    constructor(serviceRepository: ServiceRepository) {
        this.directory = process.env.INVOICES_DIR!;
        this.serviceRepository = serviceRepository;
    }

    async getFilteredFiles(): Promise<string[]> {
        const files = await fs.promises.readdir(this.directory);
        return files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
    }

    async prepareFilesToUpload(): Promise<FileUploadData[]> {
        const files = await this.getFilteredFiles();
        const strategies: Record<string, FileProcessorStrategy> = {
            invoice: new InvoiceProcessor(this.serviceRepository),
            bankTransfer: new BankTransferProcessor(new PdfProcessor())
        };

        const groupedFiles: Record<string, string[]> = {};
        for (const file of files) {
            const strategyKey = file.includes('comprobante') ? 'bankTransfer' : 'invoice';
            if (!groupedFiles[strategyKey]) groupedFiles[strategyKey] = [];
            groupedFiles[strategyKey].push(file);
        }
    
        const results = await Promise.all(
            Object.entries(groupedFiles).map(([key, groupFiles]) => {
                const strategy = strategies[key];
                return strategy ? strategy.process(groupFiles, this.directory) : Promise.resolve([]);
            })
        );

        return results.flat();
    }
}
