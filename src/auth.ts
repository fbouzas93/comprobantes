import fs from 'fs/promises';
import { OAuth2Client } from 'google-auth-library';
import { authenticate } from '@google-cloud/local-auth';
import { CREDENTIALS_PATH, TOKEN_PATH, SCOPES } from './config/config';

export async function loadSavedCredentials(): Promise<OAuth2Client | null> {
  try {
    const content = await fs.readFile(TOKEN_PATH, 'utf-8');
    const credentials = JSON.parse(content);

    const { client_id, client_secret, refresh_token } = credentials;
    const oauth2Client = new OAuth2Client(client_id, client_secret);
    oauth2Client.setCredentials({ refresh_token });

    try {
      const tokenResponse = await oauth2Client.getAccessToken();
      if (!tokenResponse.token) throw new Error('Token expired');
      return oauth2Client;
    } catch (error) {
      console.warn('⚠️ Token expired, refreshing...');
      if (refresh_token) {
        try {
          const refreshed = await oauth2Client.refreshAccessToken();
          oauth2Client.setCredentials(refreshed.credentials);
          await saveCredentials(oauth2Client);
          return oauth2Client;
        } catch (refreshError) {
          console.error('❌ Error while refreshing token:', refreshError);
        }
      }
      return null;
    }
  } catch {
    return null;
  }
}

async function saveCredentials(client: OAuth2Client) {
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;

  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });

  await fs.writeFile(TOKEN_PATH, payload);
}

export async function authorize(): Promise<OAuth2Client> {
  let client = await loadSavedCredentials();
  if (client) return client;

  client = await authenticate({ scopes: SCOPES, keyfilePath: CREDENTIALS_PATH });

  if (client.credentials) await saveCredentials(client);

  return client;
}
