// Google Drive service removed. This file intentionally left as a stub
// to avoid breaking imports during migration to Cloudflare R2.

class GoogleDriveService {
  initApiKey() {
    return false;
  }
  initServiceAccount() {
    return false;
  }
  initOAuth2() {
    return false;
  }
  isConfigured() {
    return false;
  }
  async getBooks() {
    throw new Error('Google Drive removed');
  }
  async getBookById() {
    throw new Error('Google Drive removed');
  }
  async getBookDownloadStream() {
    throw new Error('Google Drive removed');
  }
  async searchBooks() {
    throw new Error('Google Drive removed');
  }
  async getAccessToken() {
    return null;
  }
  async getBookThumbnailResponse() {
    throw new Error('Google Drive removed');
  }
}

export default GoogleDriveService;
