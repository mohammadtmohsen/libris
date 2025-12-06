import { Router } from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import bookRoutes from './bookRoutes.js';
import storageRoutes from './storageRoutes.js';
import progressRoutes from './progressRoutes.js';
import invitationRoutes from './invitationRoutes.js';
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
router.use('/books', bookRoutes);
router.use('/storage', storageRoutes);
router.use('/progress', progressRoutes);
router.use('/invitations', invitationRoutes);

export default router;
