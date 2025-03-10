import sequelize from './config/database';
import { ServiceRepository } from './repositories/ServiceRepository';
import { FileService } from './services/FileService';
import { DriveService } from './services/DriveService';
import './events/registerListeners';

async function main() {
  try {
    await sequelize.sync({ force: false });

    const serviceRepository = new ServiceRepository();
    const fileService = new FileService(serviceRepository);
    const driveService = await DriveService.createInstance();

    const filesToUpload = await fileService.prepareFilesToUpload();
    await driveService.uploadFilesToDrive(filesToUpload);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
