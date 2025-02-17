import { drive_v3, google } from "googleapis";
import { authorize } from "../auth";
import sequelize from "../config/database";
import { Apartment } from "../models/Apartment";
import { Service } from "../models/Service";

interface FolderNode {
    id: string;
    name: string;
    subfolders: FolderNode[];
}

async function main() {
    const authClient = await authorize();
    const driveClient = google.drive({ version: 'v3', auth: authClient });
    await sequelize.sync({ force: false });


    const folderTree = await getFolderTree(driveClient);
    // populateServices(folderTree);
    populateBills(driveClient, folderTree);
}

async function populateBills(driveClient: drive_v3.Drive, folderTree: FolderNode[]) {
    //por cada apartment y cada service, descargar todos los archivos.
    for (const apartment of folderTree) {
        for (const service of apartment.subfolders) {

            const res: any = await driveClient.files.list({
                q: `'${service.id}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
                fields: 'files(id, name)',
            });
            
            const files = res.data.files || [];
            console.log(files);

            // await Service.findOrCreate({
            //     where: { name: service.name },
            //     defaults: {
            //         name: service.name,
            //         apartment_id: apartmentId,
            //         drive_id: service.id
            //     }
            // });
        }
    }
    //updatear el identifier_code de cada service
    //popular los bills
}

async function getSubfolders(driveClient: drive_v3.Drive, folderId: string): Promise<FolderNode[]> {
    let folders: FolderNode[] = [];
    let pageToken: string | null = null;

    do {
        const res: any = await driveClient.files.list({
            q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
            fields: 'nextPageToken, files(id, name)',
            pageToken: pageToken || undefined
        });

        const files = res.data.files || [];

        folders = folders.concat(
            files.map((file: { id: string, name: string }) => ({
                id: file.id!,
                name: file.name!,
                subfolders: []
            }))
        );

        pageToken = res.data.nextPageToken || null;
    } while (pageToken);

    for (const folder of folders) {
        folder.subfolders = await getSubfolders(driveClient, folder.id);
    }

    return folders;
}

async function getFolderTree(driveClient: drive_v3.Drive) {
    const rootFolderId = '1oWlc7maKqG6s7HklIXB4aK-h43Sm9lq_';
    const tree = await getSubfolders(driveClient, rootFolderId);

    return tree;
}

async function populateServices(folderTree: FolderNode[]) {
    const apartments = await getOrCreateApartments(folderTree);

    for (const folder of folderTree) {
        const apartmentId = apartments.find(a => a.description === folder.name)?.id;
        for (const service of folder.subfolders) {
            await Service.findOrCreate({
                where: { name: service.name },
                defaults: {
                    name: service.name,
                    apartment_id: apartmentId,
                    drive_id: service.id
                }
            });
        }
    }
}

async function getOrCreateApartments(folderTree: FolderNode[]) {
    for (const folder of folderTree) {
        await Apartment.findOrCreate({
            where: { description: folder.name },
            defaults: { description: folder.name }
        });
    }

    return Apartment.findAll();
}

main();