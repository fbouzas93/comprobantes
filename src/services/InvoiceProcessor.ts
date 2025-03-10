import { FileUploadData } from "../interfaces/FileUploadData";
import { ServiceRepository } from "../repositories/ServiceRepository";
import { extractIdentifiers } from "../utils/extractIdentifiers";
import { FileProcessorStrategy } from "./FileProcessorStrategy";

export class InvoiceProcessor implements FileProcessorStrategy {
    constructor(private serviceRepository: ServiceRepository) {}

    async process(files: string[], directory: string): Promise<FileUploadData[]> {
        const identifiers = await extractIdentifiers(files);
        const services = await this.serviceRepository.getServicesByIdentifier(identifiers);

        return Promise.all(files.map(async (invoice) => {
            const identifier = await extractIdentifiers([invoice]);
            const service = services.find(s => s.identifier_code === identifier[0]);

            return service ? { localFilePath: `${directory}/${invoice}`, service } : null;
        })).then(results => results.filter(Boolean) as FileUploadData[]);
    }
}