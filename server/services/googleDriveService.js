import { google } from 'googleapis';
import fs from 'fs';

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.authType = null;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  // API Key authentication
  initApiKey() {
    const key = process.env.GOOGLE_API_KEY;
    if (!key) return false;
    try {
      // For discovery APIs, API key can be passed directly
      this.drive = google.drive({ version: 'v3', auth: key });
      this.authType = 'apiKey';
      return true;
    } catch (e) {
      console.error('initApiKey error:', e.message);
      return false;
    }
  }

  // Service Account authentication
  initServiceAccount() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) return false;
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      // Some users paste the full downloaded JSON or only the "web"/"installed" payload.
      // GoogleAuth expects {client_email, private_key}. If not present, abort.
      if (!credentials.client_email || !credentials.private_key) {
        console.warn('Service account JSON missing client_email/private_key.');
        return false;
      }
    } catch (e) {
      console.warn('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', e.message);
      return false;
    }
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    this.drive = google.drive({ version: 'v3', auth });
    this.authType = 'serviceAccount';
    return true;
  }

  // OAuth2 authentication
  initOAuth2() {
    const {
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI,
      GOOGLE_REFRESH_TOKEN,
    } = process.env;
    if (
      !GOOGLE_CLIENT_ID ||
      !GOOGLE_CLIENT_SECRET ||
      !GOOGLE_REDIRECT_URI ||
      !GOOGLE_REFRESH_TOKEN
    ) {
      return false;
    }
    const oAuth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
    this.drive = google.drive({ version: 'v3', auth: oAuth2Client });
    this.authType = 'oauth2';
    return true;
  }

  isConfigured() {
    return !!this.drive && !!this.folderId;
  }

  // List all books (PDFs) in the folder
  async getBooks() {
    if (!this.isConfigured()) throw new Error('Google Drive not configured');
    const res = await this.drive.files.list({
      q: `'${this.folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'files(id, name, mimeType, size, modifiedTime)',
      spaces: 'drive',
    });
    return res.data.files.map((f) => ({
      id: f.id,
      fileName: f.name,
      mimeType: f.mimeType,
      size: f.size,
      modifiedTime: f.modifiedTime,
      title: f.name.replace(/\.pdf$/i, ''),
    }));
  }

  // Get a book by ID
  async getBookById(id) {
    if (!this.isConfigured()) throw new Error('Google Drive not configured');
    const res = await this.drive.files.get({
      fileId: id,
      fields: 'id, name, mimeType, size, modifiedTime',
    });
    if (!res.data) throw new Error('File not found');
    return {
      id: res.data.id,
      fileName: res.data.name,
      mimeType: res.data.mimeType,
      size: res.data.size,
      modifiedTime: res.data.modifiedTime,
      title: res.data.name.replace(/\.pdf$/i, ''),
    };
  }

  // Download a book as a stream
  async getBookDownloadStream(id) {
    if (!this.isConfigured()) throw new Error('Google Drive not configured');
    const res = await this.drive.files.get({
      fileId: id,
      alt: 'media',
      responseType: 'stream',
    });
    return res.data;
  }

  // Search books by name
  async searchBooks(searchTerm) {
    if (!this.isConfigured()) throw new Error('Google Drive not configured');
    const res = await this.drive.files.list({
      q: `'${this.folderId}' in parents and mimeType='application/pdf' and trashed=false and name contains '${searchTerm}'`,
      fields: 'files(id, name, mimeType, size, modifiedTime)',
      spaces: 'drive',
    });
    return res.data.files.map((f) => ({
      id: f.id,
      fileName: f.name,
      mimeType: f.mimeType,
      size: f.size,
      modifiedTime: f.modifiedTime,
      title: f.name.replace(/\.pdf$/i, ''),
    }));
  }
}

export default GoogleDriveService;
