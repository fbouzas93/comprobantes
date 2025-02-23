import { drive_v3, google } from "googleapis";
import { authorize } from "../auth";
import sequelize from "../config/database";
import { Apartment } from "../models/Apartment";
import { Bill } from "../models/Bill";
import { Service } from "../models/Service";
import fs from 'fs';
import { createBillFromPDF } from "../events/listeners/saveBillListener";
import { randomUUID } from 'crypto';
import { PdfProcessor } from "../services/PdfProcessor";

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
    await populateServices(folderTree);
    await populateBills(driveClient, folderTree);
}

async function populateBills(driveClient: drive_v3.Drive, folderTree: FolderNode[]) {
    let billsPopulated = 0;
    const inDBbills = await Bill.findAll({
        attributes: ['drive_id']
    });
    const inDBdriveIds = new Set(inDBbills.map(bill => bill.drive_id));

    const services = await Service.findAll();
    const servicesMap = new Map(services.map(service => [service.drive_id, service]));

    for (const apartment of folderTree) {
        for (const serviceFolder of apartment.subfolders) {
            const service = servicesMap.get(serviceFolder.id);
            if (!service) {
                console.log('Service not found: ', serviceFolder.id);
                throw new Error("Service not found.");
            }
            const res: any = await driveClient.files.list({
                q: `'${serviceFolder.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                fields: 'files(id, name)',
            });

            const yearFolders = res.data.files || [];

            for (const yearFolder of yearFolders) {
                const res: any = await driveClient.files.list({
                    q: `'${yearFolder.id}' in parents and trashed = false`,
                    fields: 'files(id, name)',
                });

                const bills = res.data.files || [];

                for (const bill of bills) {
                    if (!inDBdriveIds.has(bill.id)) {
                        try {
                            const pdf = await downloadPDF(driveClient, bill.id);
                            const pdfProcessor = new PdfProcessor();
                            await pdfProcessor.processPdf(pdf);
                            await createBillFromPDF(pdfProcessor, service.id, service.apartment_id, bill.id);

                            if (!service.identifier_code) {
                                const identifierCode = pdfProcessor.extractIdentifierCode();
                                if (identifierCode) {
                                    service.identifier_code = identifierCode;
                                    service.save();
                                } else {
                                    console.log('Failed to extract identifier code');
                                }
                            }
                            billsPopulated++;
                            console.log(`bill populated succesfully: ${bill.name}`);
                            fs.unlinkSync(pdf);
                        } catch (error) {
                            console.error(error);
                            throw new Error(`Error creating bills: ${service.name}, ${bill.name}`);
                        }
                    }
                }
            }
        }
    }
    console.log('Bills populated: ' + billsPopulated);
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

    for (const apartmentFolder of folderTree) {
        const apartmentId = apartments.find(a => a.description === apartmentFolder.name)?.id;
        for (const service of apartmentFolder.subfolders) {
            await Service.findOrCreate({
                where: { name: service.name, apartment_id: apartmentId },
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

async function downloadPDF(driveClient: drive_v3.Drive, fileId: string): Promise<string> {
    const tempFileName = `./tmp/temp_${randomUUID()}.pdf`;
    const dest = fs.createWriteStream(tempFileName);

    const res = await driveClient.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
    );

    res.data.pipe(dest);

    return new Promise((resolve, reject) => {
        dest.on('finish', () => resolve(tempFileName));
        dest.on('error', reject);
    });
}

main();