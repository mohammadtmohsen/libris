import { body, param } from 'express-validator';

export const createUserValidator = [
  body('displayName')
    .isLength({ min: 3 })
    .withMessage('Display name is required'),
  body('username')
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('email').isEmail().withMessage('Email must be a valid email address'),
];

export const userIdValidator = [
  param('id').isMongoId().withMessage('Invalid user ID format'),
  // param('id').isEmpty.apply().withMessage('Invalid user ID format'),
];
