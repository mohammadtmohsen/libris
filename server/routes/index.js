import { Router } from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import workoutRoutes from './workoutRoutes.js';
import recordRoutes from './recordRoutes.js';
import routineRoutes from './routineRoutes.js';
const router = Router();

// register routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/workout', workoutRoutes);
router.use('/record', recordRoutes);
router.use('/routine', routineRoutes);

export default router;
