import * as fs from 'fs';
import { extractIdentifiers } from '../utils/extractIdentifiers';
import { ServiceRepository } from '../repositories/ServiceRepository';
import { FileUploadData } from '../interfaces/FileUploadData';

export class FileService {
    private directory: string;
    private serviceRepository: ServiceRepository;

    constructor(directory: string, serviceRepository: ServiceRepository) {
        this.directory = directory;
        this.serviceRepository = serviceRepository;
    }

    async getFilteredFiles(): Promise<string[]> {
        const files = await fs.promises.readdir(this.directory);
        return files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
    }

    async prepareFilesToUpload(): Promise<FileUploadData[]> {
        const filteredFiles = await this.getFilteredFiles();
        const identifiers = await extractIdentifiers(filteredFiles);
        const services = await this.serviceRepository.getServicesByIdentifier(identifiers);

        return (await Promise.all(
            filteredFiles.map(async (file) => {
                const identifier = await extractIdentifiers([file]);
                const service = services.find(s => s.identifier_code === identifier[0]);

                return service ? { localFilePath: `${this.directory}/${file}`, service: service } : null;
            })
        )).filter(Boolean) as FileUploadData[];
    }
}
