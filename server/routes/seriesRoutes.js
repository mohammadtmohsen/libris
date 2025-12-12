import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createSeries,
  deleteSeries,
  getAllSeries,
  updateSeries,
} from '../controllers/seriesController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { handleValidationErrors } from '../validators/helpers.js';

const router = Router();

const totalPartsValidator = body('totalParts')
  .optional({ nullable: true })
  .customSanitizer((value) => {
    if (value === null || value === undefined || value === '') return null;
    const cast = Number(value);
    return Number.isNaN(cast) ? value : cast;
  })
  .custom((value) => {
    if (value === null) return true;
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('totalParts must be a positive integer');
    }
    return true;
  });

router.use(authMiddleware);

router.get('/', getAllSeries);

router.post(
  '/',
  body('name').isString().trim().notEmpty(),
  totalPartsValidator,
  handleValidationErrors,
  createSeries
);

router.patch(
  '/:id',
  param('id').isMongoId(),
  body('name').optional().isString().trim().notEmpty(),
  totalPartsValidator,
  handleValidationErrors,
  updateSeries
);

router.delete(
  '/:id',
  param('id').isMongoId(),
  handleValidationErrors,
  deleteSeries
);

export default router;
