import { Router } from 'express';
import {
  createOne,
  deleteOne,
  getAllWorkouts,
  updateOne,
} from '../controllers/workoutController.js';

const router = Router();

router.route('/').get(getAllWorkouts);

router.route('/').post(createOne);

router.route('/:id').put(updateOne);

router.route('/:id').delete(deleteOne);

export default router;
