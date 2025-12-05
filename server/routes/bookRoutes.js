import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllBooks,
  getBookById,
  completeUpload,
  deleteBook,
  searchBooks,
  updateBook,
  updatePages,
} from '../controllers/booksController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { handleValidationErrors } from '../validators/helpers.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/complete',
  body('title').isString().notEmpty(),
  body('author').optional().isString(),
  body('description').optional().isString(),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString(),
  body('status')
    .optional()
    .isIn(['not_started', 'want_to_read', 'reading', 'finished', 'abandoned']),
  body('file.key').isString().notEmpty(),
  body('file.mime').isString().notEmpty(),
  body('file.size').isInt({ min: 1 }).toInt(),
  body('file.pageCount').optional().isInt({ min: 1 }).toInt(),
  body('file.originalName').optional().isString(),
  body('cover').optional().isObject(),
  body('cover.key').optional().isString().notEmpty(),
  body('cover.mime').optional().isString(),
  body('cover.size').optional().isInt({ min: 1 }).toInt(),
  body('cover.originalName').optional().isString(),
  handleValidationErrors,
  completeUpload
);

router.get(
  '/',
  query('status')
    .optional()
    .isIn(['not_started', 'want_to_read', 'reading', 'finished', 'abandoned']),
  query('tag').optional().isString(),
  query('search').optional().isString(),
  handleValidationErrors,
  getAllBooks
);

router.get(
  '/search',
  query('search').optional().isString(),
  query('status')
    .optional()
    .isIn(['not_started', 'want_to_read', 'reading', 'finished', 'abandoned']),
  handleValidationErrors,
  searchBooks
);

router.get(
  '/:id',
  param('id').isMongoId(),
  handleValidationErrors,
  getBookById
);

router.patch(
  '/:id',
  param('id').isMongoId(),
  body('title').optional().isString(),
  body('author').optional().isString(),
  body('description').optional().isString(),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString(),
  body('status')
    .optional()
    .isIn(['not_started', 'want_to_read', 'reading', 'finished', 'abandoned']),
  handleValidationErrors,
  updateBook
);

router.patch(
  '/:id/pages',
  param('id').isMongoId(),
  body('pagesRead').optional().isInt({ min: 0 }).toInt(),
  body('pageCount').optional().isInt({ min: 0 }).toInt(),
  handleValidationErrors,
  updatePages
);

router.delete(
  '/:id',
  param('id').isMongoId(),
  handleValidationErrors,
  deleteBook
);

export default router;
