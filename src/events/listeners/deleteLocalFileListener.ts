import { eventBus } from '../eventBus';
import * as fs from 'fs';
import { FileUploadData } from '../../interfaces/FileUploadData';

eventBus.on('FileUploaded', (file: FileUploadData) => {
    try {
        // fs.unlinkSync(file.localFilePath);
        console.log(`🗑️ Deleted local file: ${file.localFilePath}`);
    } catch (error) {
        console.error(`❌ Error deleting file: ${file.localFilePath}`, error);
    }
});