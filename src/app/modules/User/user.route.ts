import { Router } from 'express';
import { UserControllers } from './user.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';

const router = Router();

router.get('/me', auth('CUSTOMER', 'RIDER', 'ADMIN', 'MODERATOR'), UserControllers.getMyProfile);
router.patch('/me', auth('CUSTOMER', 'RIDER', 'ADMIN', 'MODERATOR'), validateRequest(UserValidation.updateProfileSchema), UserControllers.updateMyProfile);
router.post('/forgot-password', validateRequest(UserValidation.forgotPasswordSchema), UserControllers.handleForgotPassword);
router.post('/reset-password', validateRequest(UserValidation.resetPasswordSchema), UserControllers.handleResetPassword);
router.get('/my-parcels', auth('CUSTOMER'), UserControllers.getMyParcels);
router.get('/my-payments', auth('CUSTOMER'), UserControllers.getMyPayments);
export const UserRoutes = router;