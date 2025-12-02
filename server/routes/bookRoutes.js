import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  completeUpload,
  deleteBook,
  downloadBook,
  getAllBooks,
  getBookById,
  getBookThumbnail,
  getServiceStatus,
  getSignedUrlForBook,
  presignUpload,
  searchBooks,
  updateBook,
  updatePages,
} from '../controllers/booksController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { handleValidationErrors } from '../validators/helpers.js';

const router = Router();

router.use(authMiddleware);

router.get('/status', getServiceStatus);

router.post(
  '/presign-upload',
  body('mimeType').isString().withMessage('mimeType is required'),
  body('fileName').optional().isString(),
  body('isCover').optional().isBoolean().toBoolean(),
  body('contentLength').optional().isInt({ min: 1 }).toInt(),
  handleValidationErrors,
  presignUpload
);

router.post(
  '/complete',
  body('title').isString().notEmpty(),
  body('author').optional().isString(),
  body('description').optional().isString(),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString(),
  body('status')
    .optional()
    .isIn(['not_started', 'reading', 'finished', 'abandoned']),
  body('visibility').optional().isIn(['private', 'public']),
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
    .isIn(['not_started', 'reading', 'finished', 'abandoned']),
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
    .isIn(['not_started', 'reading', 'finished', 'abandoned']),
  handleValidationErrors,
  searchBooks
);

router.get(
  '/:id',
  param('id').isMongoId(),
  handleValidationErrors,
  getBookById
);

router.get(
  '/:id/url',
  param('id').isMongoId(),
  query('includeCover').optional().isBoolean().toBoolean(),
  query('expiresIn').optional().isInt({ min: 60, max: 3600 }).toInt(),
  handleValidationErrors,
  getSignedUrlForBook
);

router.get(
  '/:id/download',
  param('id').isMongoId(),
  handleValidationErrors,
  downloadBook
);

router.get(
  '/:id/thumbnail',
  param('id').isMongoId(),
  handleValidationErrors,
  getBookThumbnail
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
    .isIn(['not_started', 'reading', 'finished', 'abandoned']),
  body('visibility').optional().isIn(['private', 'public']),
  handleValidationErrors,
  updateBook
);

router.patch(
  '/:id/pages',
  param('id').isMongoId(),
  body('currentPage').optional().isInt({ min: 0 }).toInt(),
  body('totalPages').optional().isInt({ min: 0 }).toInt(),
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
