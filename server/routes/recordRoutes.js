import { Router } from 'express';

import {
  getAllRecords,
  createOne,
  getRecordById,
  updateRecord,
  deleteRecord,
  createMany,
} from '../controllers/recordController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.route('/').get(authMiddleware, getAllRecords);

router.route('/').post(authMiddleware, createOne);

router.route('/many').post(authMiddleware, createMany);

router.route('/:id').get(authMiddleware, getRecordById);

router.route('/:id').put(authMiddleware, updateRecord);

router.route('/:id').delete(authMiddleware, deleteRecord);

export default router;
