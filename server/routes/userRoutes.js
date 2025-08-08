import { Router } from 'express';
const router = Router();
import {
  getAllUsers,
  getUserById,
  createNewUser,
  updateUser,
  deleteUser,
} from '../controllers/usersController.js';
import {
  createUserValidator,
  userIdValidator,
} from '../validators/userValidator.js';
import { handleValidationErrors } from '../validators/helpers.js';

router.route('/').get(getAllUsers);

router
  .route('/')
  .post(createUserValidator, handleValidationErrors, createNewUser);

router.route('/:id').get(userIdValidator, handleValidationErrors, getUserById);

router
  .route('/:id')
  .put(
    userIdValidator,
    createUserValidator,
    handleValidationErrors,
    updateUser
  );

router
  .route('/:id')
  .delete(userIdValidator, handleValidationErrors, deleteUser);

export default router;
