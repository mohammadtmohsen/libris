import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  downloadBook,
  getBookThumbnail,
  getServiceStatus,
  getSignedUrlForBook,
  presignUpload,
  handleStorageErrors,
} from '../controllers/storageController.js';
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

router.use(handleStorageErrors);

export default router;
