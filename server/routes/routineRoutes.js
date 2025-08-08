import { Router } from 'express';
import {
  activateRoutine,
  createRoutine,
  deleteRoutine,
  getActiveRoutine,
  getAllRoutines,
  getRoutineById,
  updateRoutine,
} from '../controllers/routineController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.route('/').get(authMiddleware, getAllRoutines);

router.route('/').post(authMiddleware, createRoutine);

router.route('/:id').put(authMiddleware, updateRoutine);

router.route('/active').get(authMiddleware, getActiveRoutine);

router.route('/:id/activate').put(authMiddleware, activateRoutine);

router.route('/:id').delete(authMiddleware, deleteRoutine);

router.route('/:id').get(authMiddleware, getRoutineById);

export default router;
