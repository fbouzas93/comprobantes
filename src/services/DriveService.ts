import { authorize } from '../auth';
import { google, drive_v3 } from 'googleapis';
import { FolderService } from './FolderService';
import { FileUploadData } from '../interfaces/FileUploadData';
import * as fs from 'fs';
import { eventBus } from '../events/eventBus';

export class DriveService {
  private folderService: FolderService;
  private driveClient: drive_v3.Drive;

  constructor(folderService: FolderService, driveClient: drive_v3.Drive) {
    this.folderService = folderService;
    this.driveClient = driveClient;
  }

  static async createInstance(): Promise<DriveService> {
    const authClient = await authorize();
    const driveClient = google.drive({ version: 'v3', auth: authClient });
    const folderService = new FolderService(driveClient);
    return new DriveService(folderService, driveClient);
  }

  async uploadFilesToDrive(filesToUpload: FileUploadData[]) {
    if (filesToUpload.length === 0) {
      console.log('No files to upload.');
      return;
    }
    
    const uploadTasks = filesToUpload.map(async (file) => {
      const parentFolderId = await this.folderService.getFolderByYear(file.service.drive_id);
      await this.uploadFile(file, parentFolderId);
    });

    try {
      await Promise.all(uploadTasks);
      console.log('Upload completed.');
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }

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
      
      eventBus.emit('FileUploaded', file, res.data.id);

      return res.data;
    } catch (error) {
      console.error(`Error uploading ${fileName}:`, error);
      throw error;
    }
  }
}
