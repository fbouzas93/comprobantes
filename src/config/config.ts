import path from 'path';
import process from 'process';

export const SCOPES = ['https://www.googleapis.com/auth/drive'];

export const TOKEN_PATH = path.join(process.cwd(), 'token.json');
export const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');