import * as fs from 'fs';
import { drive_v3 } from 'googleapis';
import { eventBus } from '../events/eventBus';
import { FileUploadData } from '../interfaces/FileUploadData';

export class Uploader {
  constructor(private driveClient: drive_v3.Drive) {}

  async uploadFile(file: FileUploadData, parentFolderId: string): Promise<drive_v3.Schema$File> {
    const currentMonth = new Date().getMonth() + 1; //Jan - 0, Feb - 1.
    const fileName = `${currentMonth}.pdf`;
    
    const fileMetadata = {
      name: fileName,
      parents: [parentFolderId],
    };
    
    const media = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(file.localFilePath),
    };

    try {
      const res = await this.driveClient.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name',
      });

      eventBus.emit('FileUploaded', file);

      return res.data;
    } catch (error) {
      console.error(`Error uploading ${fileName}:`, error);
      throw error;
    }
  }
}