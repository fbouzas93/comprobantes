export async function extractIdentifiers(files: string[]) {
    return files.map(file => {
        const match = file.match(/(\d+)\.pdf$/);
        return match ? match[1].replace(/^0+/, '') : null;
    });
}
