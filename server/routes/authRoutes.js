import { Router } from 'express';
const router = Router();

import {
  login,
  refreshTokenHandler,
  logout,
} from '../controllers/authController.js';
import passport from 'passport';

router
  .route('/')
  .post(passport.authenticate('local', { session: false }), login);
router.route('/refresh').post(refreshTokenHandler);
router.route('/logout').post(logout);

export default router;
