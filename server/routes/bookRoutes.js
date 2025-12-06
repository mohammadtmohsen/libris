import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllBooks,
  getBookById,
  completeUpload,
  deleteBook,
  searchBooks,
  updateBook,
  READING_STATUS_VALUES,
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
    .custom((value) => {
      const statuses = Array.isArray(value) ? value : [value];
      const isValid = statuses.every((s) => READING_STATUS_VALUES.includes(s));
      if (!isValid) {
        throw new Error('Invalid status value');
      }
      return true;
    }),
  query('tags').optional().custom((value) => {
    if (Array.isArray(value)) {
      const allStrings = value.every((tag) => typeof tag === 'string');
      if (!allStrings) throw new Error('Tags must be strings');
      return true;
    }
    if (typeof value === 'string') return true;
    throw new Error('Invalid tags value');
  }),
  query('tags.*').optional().isString(),
  query('tag').optional().isString(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  handleValidationErrors,
  getAllBooks
);

router.get(
  '/search',
  query('search').optional().isString(),
  query('status')
    .optional()
    .custom((value) => {
      const statuses = Array.isArray(value) ? value : [value];
      const isValid = statuses.every((s) => READING_STATUS_VALUES.includes(s));
      if (!isValid) {
        throw new Error('Invalid status value');
      }
      return true;
    }),
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
  handleValidationErrors,
  updateBook
);

router.delete(
  '/:id',
  param('id').isMongoId(),
  handleValidationErrors,
  deleteBook
);

export default router;
