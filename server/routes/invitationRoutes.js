import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  inviteUser,
  listInvitedUsers,
  deleteInvitedUser,
} from '../controllers/invitationsController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { handleValidationErrors } from '../validators/helpers.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listInvitedUsers);

router.post(
  '/',
  body('username').isString().trim().notEmpty(),
  body('email').optional().isEmail().withMessage('Email must be valid'),
  body('displayName').optional().isString(),
  body('role').optional().isIn(['admin', 'user']),
  handleValidationErrors,
  inviteUser
);

router.delete(
  '/:id',
  param('id').isMongoId(),
  handleValidationErrors,
  deleteInvitedUser
);

export default router;
