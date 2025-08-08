import express from 'express';
import BooksController from '../controllers/booksController.js';

const router = express.Router();
const booksController = new BooksController();

/**
 * Books Routes
 * All routes for managing and fetching books from Google Drive
 */

// Get service status and configuration
router.get('/status', booksController.getServiceStatus);

// Search books by name
router.get('/search', booksController.searchBooks);

// Get all books
router.get('/', booksController.getAllBooks);

// Get a specific book by ID
router.get('/:id', booksController.getBookById);

// Download a book file
router.get('/:id/download', booksController.downloadBook);

export default router;
