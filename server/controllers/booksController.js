import asyncHandler from 'express-async-handler';

// Temporary stub controller: Google services removed. To be replaced with Cloudflare R2.
class BooksController {
  constructor() {}

  getAllBooks = asyncHandler(async (req, res) => {
    return res.status(503).json({
      success: false,
      error: 'Books service disabled',
      message: 'Google Drive integration removed. R2 integration pending.',
    });
  });

  getBookById = asyncHandler(async (req, res) => {
    return res.status(503).json({
      success: false,
      error: 'Books service disabled',
      message: 'Google Drive integration removed. R2 integration pending.',
    });
  });

  downloadBook = asyncHandler(async (req, res) => {
    return res.status(503).json({
      success: false,
      error: 'Books service disabled',
      message: 'Google Drive integration removed. R2 integration pending.',
    });
  });

  searchBooks = asyncHandler(async (req, res) => {
    return res.status(503).json({
      success: false,
      error: 'Books service disabled',
      message: 'Google Drive integration removed. R2 integration pending.',
    });
  });

  getBookThumbnail = asyncHandler(async (req, res) => {
    return res.status(503).json({
      success: false,
      error: 'Books service disabled',
      message: 'Google Drive integration removed. R2 integration pending.',
    });
  });

  getServiceStatus = asyncHandler(async (req, res) => {
    return res.json({
      success: true,
      data: {
        configured: false,
        authType: null,
        hasApiKey: false,
        hasServiceAccount: false,
        hasOAuthCredentials: false,
        hasFolderId: false,
      },
      message: 'Books service disabled; awaiting Cloudflare R2 migration',
    });
  });
}

export default BooksController;
