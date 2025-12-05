import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getProgressForBook,
  upsertProgress,
} from '../controllers/progressController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { handleValidationErrors } from '../validators/helpers.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/:bookId',
  param('bookId').isMongoId(),
  handleValidationErrors,
  getProgressForBook
);

router.patch(
  '/:bookId',
  param('bookId').isMongoId(),
  body('status')
    .optional()
    .isIn(['not_started', 'want_to_read', 'reading', 'finished', 'abandoned']),
  body('pagesRead').optional().isInt({ min: 0 }).toInt(),
  handleValidationErrors,
  upsertProgress
);

export default router;
