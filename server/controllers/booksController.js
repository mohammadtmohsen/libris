import GoogleDriveService from '../services/googleDriveService.js';
import asyncHandler from 'express-async-handler';

const fetchWithRetry = (fn, retries = 3, delay = 100) => {
  return fn().catch((err) => {
    // Check if the error is a rate limit error (status code 429 or 403)
    // You might need to adjust this check based on the actual error object from your service
    const isRateLimitError =
      err.code === 429 ||
      err.code === 403 ||
      err.status === 429 ||
      err.status === 403;

    if (isRateLimitError && retries > 0) {
      console.log(
        `Rate limit hit. Retrying in ${delay}ms. Retries left: ${retries}`
      );
      // Wait for the delay, then retry with one less retry attempt and double the delay.
      return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
        fetchWithRetry(fn, retries - 1, delay * 2)
      );
    }
    // If it's not a rate limit error or we're out of retries, throw the error.
    return Promise.reject(err);
  });
};

/**
 * Controller for handling book-related operations with Google Drive
 */
class BooksController {
  constructor() {
    this.googleDriveService = new GoogleDriveService();
    this.initializeService();
  }

  /**
   * Initialize the Google Drive service with the appropriate authentication method
   */
  initializeService() {
    // Try different authentication methods in order of preference
    // 1) Service Account (best for server-to-server)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      console.log(
        'Attempting to initialize Google Drive with Service Account...'
      );
      if (this.googleDriveService.initServiceAccount()) {
        console.log(
          'Google Drive service initialized successfully with Service Account'
        );
        return;
      } else {
        console.warn('Service Account key present but Drive init failed.');
      }
    }

    // 2) OAuth2 (user-consented server-side)
    if (
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI
    ) {
      console.log('Attempting to initialize Google Drive with OAuth2...');
      if (this.googleDriveService.initOAuth2()) {
        console.log('Google Drive OAuth2 client configured successfully');
        return;
      } else {
        console.warn('OAuth2 env present but Drive init failed.');
      }
    }

    // 3) API Key (limited; metadata and public files only)
    if (process.env.GOOGLE_API_KEY) {
      console.log('Attempting to initialize Google Drive with API Key...');
      if (this.googleDriveService.initApiKey()) {
        console.log(
          'Google Drive service initialized successfully with API Key'
        );
        console.warn(
          'Note: API Key has limited access. Downloading private files may fail. Prefer Service Account or OAuth2.'
        );
        return;
      } else {
        console.warn('API Key present but Drive init failed.');
      }
    } else {
      console.warn('No GOOGLE_API_KEY found in environment.');
    }

    console.error(
      'Failed to initialize Google Drive service with any authentication method'
    );
  }

  /**
   * Get all books from Google Drive
   * GET /books
   */
  getAllBooks = asyncHandler(async (req, res) => {
    try {
      // Check if service is properly configured
      if (!this.googleDriveService.isConfigured()) {
        return res.status(500).json({
          success: false,
          error: 'Google Drive service not properly configured',
          message: 'Please check your environment variables',
        });
      }

      console.log('Fetching all books from Google Drive...');

      const books = await this.googleDriveService.getBooks();
      console.log('🚀 > books:', books);

      res.json({
        success: true,
        data: books.map((b) => ({
          ...b,
          // Provide a proxy URL the client can use to fetch the thumbnail safely
          thumbnailUrl: `/books/${b.id}/thumbnail`,
        })),
        total: books.length,
        message: `Found ${books.length} books`,
      });
    } catch (error) {
      console.error('Error in getAllBooks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch books',
        message: error.message,
      });
    }
  });

  /**
   * Get a specific book by ID
   * GET /books/:id
   */
  getBookById = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Book ID is required',
          message: 'Please provide a valid book ID',
        });
      }

      console.log(`Fetching book with ID: ${id}`);

      const book = await this.googleDriveService.getBookById(id);

      res.json({
        success: true,
        data: {
          ...book,
          thumbnailUrl: `/books/${book.id}/thumbnail`,
        },
        message: 'Book retrieved successfully',
      });
    } catch (error) {
      console.error('Error in getBookById:', error);

      if (
        error.message.includes('not found') ||
        error.message.includes('File not found')
      ) {
        return res.status(404).json({
          success: false,
          error: 'Book not found',
          message: 'The requested book does not exist',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to fetch book',
        message: error.message,
      });
    }
  });

  /**
   * Download a book file
   * GET /books/:id/download
   */
  /**
   * Download a book file
   * GET /books/:id/download
   */
  /**
   * Download a book file
   * GET /books/:id/download
   */
  /**
   * Download a book file
   * GET /books/:id/download
   */
  /**
   * Download a book file
   * GET /books/:id/download
   */
  downloadBook = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Book ID is required',
          message: 'Please provide a valid book ID',
        });
      }

      console.log(`[Books] Download request for id=${id}`);

      // Get book metadata for filename and type validation
      const book = await this.googleDriveService.getBookById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          error: 'Book not found',
        });
      }

      if (book.mimeType && book.mimeType !== 'application/pdf') {
        return res.status(415).json({
          success: false,
          error: 'Unsupported Media Type',
        });
      }

      const driveResponseObject =
        await this.googleDriveService.getBookDownloadStream(id);

      const bufferSymbol = Object.getOwnPropertySymbols(
        driveResponseObject
      ).find((s) => s.description === 'buffer');

      const fileBuffer = driveResponseObject[bufferSymbol];

      if (!fileBuffer || typeof fileBuffer.length !== 'number') {
        throw new Error(
          'Could not extract a valid buffer from the Drive response.'
        );
      }

      res.setHeader('Content-Type', 'application/pdf');

      // --- START: The Fix ---
      const fallbackFilename = book.fileName.replace(/[^\x00-\x7F]/g, '');
      const encodedFilename = encodeURIComponent(book.fileName);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${fallbackFilename}"; filename*=UTF-8''${encodedFilename}`
      );
      // --- END: The Fix ---

      res.setHeader('Content-Length', fileBuffer.length);

      console.log(
        `[Books] Sending buffer: title="${book.title}", size=${fileBuffer.length} bytes`
      );

      res.send(fileBuffer);
    } catch (error) {
      console.error('Error in downloadBook:', error);

      if (
        error.message.includes('not found') ||
        error.message.includes('File not found')
      ) {
        return res.status(404).json({
          success: false,
          error: 'Book not found',
        });
      }

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Download failed',
          message: error.message,
        });
      }
    }
  });

  /**
   * Search books by name
   * GET /books/search?q=searchTerm
   */
  searchBooks = asyncHandler(async (req, res) => {
    try {
      const { q: searchTerm } = req.query;

      if (!searchTerm || searchTerm.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Search term is required',
          message: 'Please provide a search term',
        });
      }

      console.log(`Searching books with term: ${searchTerm}`);

      const books = await this.googleDriveService.searchBooks(
        searchTerm.trim()
      );

      res.json({
        success: true,
        data: books.map((b) => ({
          ...b,
          thumbnailUrl: `/books/${b.id}/thumbnail`,
        })),
        total: books.length,
        searchTerm: searchTerm.trim(),
        message: `Found ${books.length} books matching "${searchTerm}"`,
      });
    } catch (error) {
      console.error('Error in searchBooks:', error);
      res.status(500).json({
        success: false,
        error: 'Search failed',
        message: error.message,
      });
    }
  });

  /**
   * Get/Proxy a book thumbnail image
   * GET /books/:id/thumbnail?size=256
   */
  /**
   * Get/Proxy a book thumbnail image
   * GET /books/:id/thumbnail?size=256
   */
  getBookThumbnail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const size = Math.max(
      64,
      Math.min(1024, parseInt(req.query.size, 10) || 256)
    );
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Book ID is required',
      });
    }
    try {
      // --- START: The Fix ---
      // 1. Get the special object from the service.
      const driveResponseObject = await fetchWithRetry(() =>
        this.googleDriveService.getBookThumbnailResponse(id, size)
      );

      // 2. Find the Symbol keys for the buffer and the content type.
      const symbols = Object.getOwnPropertySymbols(driveResponseObject);
      const bufferSymbol = symbols.find((s) => s.description === 'buffer');
      const typeSymbol = symbols.find((s) => s.description === 'type');

      // 3. Extract the buffer and content type using the symbols.
      const imageBuffer = driveResponseObject[bufferSymbol];
      const contentType = driveResponseObject[typeSymbol] || 'image/jpeg'; // Default to jpeg

      // 4. Safety check the buffer.
      if (!imageBuffer) {
        throw new Error(
          'Could not extract thumbnail buffer from Drive response.'
        );
      }

      // 5. Set the headers.
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', imageBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      res.setHeader('ETag', `"thumb-${id}-s${size}"`);

      // 6. Send the image buffer.
      res.send(imageBuffer);
      // --- END: The Fix ---
    } catch (error) {
      console.error('Error in getBookThumbnail:', error);
      if (
        error.message.includes('not found') ||
        error.message.includes('File not found')
      ) {
        return res.status(404).json({
          success: false,
          error: 'Book not found',
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch thumbnail',
        message: error.message,
      });
    }
  });

  /**
   * Get service status and configuration
   * GET /books/status
   */
  getServiceStatus = asyncHandler(async (req, res) => {
    try {
      const isConfigured = this.googleDriveService.isConfigured();
      const authType = this.googleDriveService.authType || null;

      res.json({
        success: true,
        data: {
          configured: isConfigured,
          authType,
          hasApiKey: !!process.env.GOOGLE_API_KEY,
          hasServiceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
          hasOAuthCredentials: !!(
            process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
          ),
          hasFolderId: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
        },
        message: isConfigured
          ? 'Service is properly configured'
          : 'Service requires configuration',
      });
    } catch (error) {
      console.error('Error in getServiceStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get service status',
        message: error.message,
      });
    }
  });
}

export default BooksController;
