import { authorize } from '../auth';
import { google } from 'googleapis';
import { FolderService } from './FolderService';
import { Uploader } from './Uploader';
import { FileUploadData } from '../interfaces/FileUploadData';

export class DriveService {
  private folderService: FolderService;
  private uploader: Uploader;

  constructor(driveClient: any, folderService: FolderService, uploader: Uploader) {
    this.folderService = folderService;
    this.uploader = uploader;
  }

  static async createInstance(): Promise<DriveService> {
    const authClient = await authorize();
    const driveClient = google.drive({ version: 'v3', auth: authClient });
    const folderService = new FolderService(driveClient);
    const uploader = new Uploader(driveClient);
    return new DriveService(driveClient, folderService, uploader);
  }

  async uploadFilesToDrive(filesToUpload: FileUploadData[]) {
    if (filesToUpload.length === 0) {
      console.log('No files to upload.');
      return;
    }
    
    const uploadTasks = filesToUpload.map(async (file) => {
      const parentFolderId = await this.folderService.getFolderByYear(file.service.drive_id);
      await this.uploader.uploadFile(file, parentFolderId);
    });

    try {
      await Promise.all(uploadTasks);
      console.log('Upload completed.');
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }
}
