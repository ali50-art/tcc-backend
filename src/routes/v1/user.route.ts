import express from 'express';

const router = express.Router();

import Authorization from '../../middlewares/auth';
import AuthorizeRole from '../../middlewares/authorizeRole';
import limiter from '../../middlewares/limiter';

import { multerConfig } from '../../utils/multer';
import multer from 'multer';

import UserValidator from '../../validators/user.validator';
import validator from '../../validators';

import UserController from '../../controllers/v1/user.controller';
import { RolesEnum } from '../../constants/constants';

router.post('/login', limiter, validator(UserValidator.loginSchema), UserController.login);

router.post('/register',multer(multerConfig).single('file'), UserController.register);

router.get('/logout', Authorization.Authenticated, UserController.logout);

router.get('/refresh-token', UserController.refreshToken);

router.post(
  '/forgot-password',
  validator(UserValidator.forgotPasswordSchema),
  UserController.forgotPassword,
);

router.put(
  '/reset-password/',
  UserController.resetPassword,
);

router.get('/profile', Authorization.Authenticated, UserController.getProfile);

router.put(
  '/profile-update',
  Authorization.Authenticated,
  UserController.updateProfile,
);

router.put(
  '/profile-password-update',
  Authorization.Authenticated,
  validator(UserValidator.updateProfilePassword),
  UserController.updateUserPassword,
);

router.post(
  '/avatar-upload',
  Authorization.Authenticated,
  multer(multerConfig).single('file'),
  UserController.avatarUpload,
);
router.post(
  '/resend-otp',
  UserController.resendOtp,
);
router.post(
  '/confirm-otp',
  UserController.confirmOtp,
);

router
  .route('/admin/users')
  .get(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    UserController.getAllUsers,
  )
  .post(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    UserController.createUser,
  );

router
  .route('/admin/users/:id')
  .get(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    UserController.getUserById,
  )
  .put(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    UserController.updateUser,
  )
  .delete(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    UserController.deleteUser,
  );

export default router;
