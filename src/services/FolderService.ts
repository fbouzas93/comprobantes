import { drive_v3 } from 'googleapis';

export class FolderService {
    constructor(private driveClient: drive_v3.Drive) { }

    async getOrCreateFolder(parentId: string, folderName: string): Promise<string> {
        try {
            const response = await this.driveClient.files.list({
                q: `'${parentId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                fields: 'files(id, name)',
                includeItemsFromAllDrives: true,
                supportsAllDrives: true,
            });
            const folders = response.data.files || [];
            if (folders.length > 0 && folders[0].id) {
                console.log(`Folder ${folderName} found: ${folders[0].id}`);
                return folders[0].id;
            }
            console.log(`Folder ${folderName} not found. Creating...`);
            const createResponse = await this.driveClient.files.create({
                requestBody: {
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [parentId],
                },
                fields: 'id',
            });
            if (!createResponse.data.id) {
                throw new Error('Error creating folder');
            }
            console.log(`Folder created: ${createResponse.data.id}`);
            return createResponse.data.id;
        } catch (error) {
            console.error('Error in getOrCreateFolder:', error);
            throw error;
        }
    }

    async getFolderByYear(parentId: string, year: string = new Date().getFullYear().toString()): Promise<string> {
        return this.getOrCreateFolder(parentId, year);
    }
}
