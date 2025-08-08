import GoogleDriveService from '../services/googleDriveService.js';
import asyncHandler from 'express-async-handler';

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

      // Get book metadata first
      const book = await this.googleDriveService.getBookById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          error: 'Book not found',
          message: 'The requested book does not exist',
        });
      }

      // Validate mime type to ensure it's a PDF
      if (book.mimeType && book.mimeType !== 'application/pdf') {
        console.warn(
          `[Books] Rejecting download, unsupported mimeType=${book.mimeType} for id=${id}`
        );
        return res.status(415).json({
          success: false,
          error: 'Unsupported Media Type',
          message: `This file is not a PDF (type: ${book.mimeType})`,
        });
      }

      // Get download stream
      const downloadStream =
        await this.googleDriveService.getBookDownloadStream(id);

      // If we have a stream, set headers then pipe
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${book.fileName}"`
      );
      res.setHeader('Accept-Ranges', 'bytes');

      if (book.size) {
        res.setHeader('Content-Length', book.size);
      }

      // Add caching headers
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      if (book.modifiedTime) {
        res.setHeader('ETag', `"${book.id}-${book.modifiedTime}"`);
      }

      console.log(`[Books] Streaming: title="${book.title}", id=${book.id}`);

      downloadStream.on('end', () => {
        console.log(`[Books] Stream finished for id=${book.id}`);
      });

      // Handle stream errors before piping response ends
      downloadStream.on('error', (error) => {
        console.error(
          '[Books] Download stream error:',
          error?.message || error
        );
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            error: 'Bad Gateway',
            message: 'Upstream failed to provide PDF stream',
          });
        } else {
          try {
            res.destroy(error);
          } catch (_) {
            // no-op
          }
        }
      });

      // Stream the file to the client
      downloadStream.pipe(res);
    } catch (error) {
      console.error('Error in downloadBook:', error);

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
        message: 'Please provide a valid book ID',
      });
    }
    try {
      const response = await this.googleDriveService.getBookThumbnailResponse(
        id,
        size
      );
      // Propagate content type from Google
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const contentLength = response.headers.get('content-length');
      res.setHeader('Content-Type', contentType);
      if (contentLength) res.setHeader('Content-Length', contentLength);
      // Cache for 1 day; include weak ETag using id and size
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('ETag', `"thumb-${id}-s${size}"`);

      // Stream body to response
      if (response.body) {
        response.body.pipe(res);
      } else {
        const buffer = Buffer.from(await response.arrayBuffer());
        res.end(buffer);
      }
    } catch (error) {
      console.error('Error in getBookThumbnail:', error);
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
