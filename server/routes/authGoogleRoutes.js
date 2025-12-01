import express from 'express';

// Google OAuth routes removed. Keep a minimal router exporting 410 responses
// to avoid accidental usage until Cloudflare R2-based auth/storage is added.
const router = express.Router();

router.all('*', (_req, res) => {
  res.status(410).json({
    success: false,
    error: 'Google OAuth removed',
    message: 'Endpoint deprecated. Migration to R2 pending.',
  });
});

export default router;
