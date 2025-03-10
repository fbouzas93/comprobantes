import { FileUploadData } from "../interfaces/FileUploadData";

export interface FileProcessorStrategy {
    process(files: string[], directory: string): Promise<FileUploadData[]>;
}