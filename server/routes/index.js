import { Router } from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import workoutRoutes from './workoutRoutes.js';
import recordRoutes from './recordRoutes.js';
import routineRoutes from './routineRoutes.js';
import bookRoutes from './bookRoutes.js';
const router = Router();

// Health check route
router.get('/', (req, res) => {
  res.json({
    message: 'Libris API Server is running!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// register routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/workout', workoutRoutes);
router.use('/record', recordRoutes);
router.use('/routine', routineRoutes);
router.use('/books', bookRoutes);

export default router;
