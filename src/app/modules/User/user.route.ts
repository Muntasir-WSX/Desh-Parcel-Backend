import { Router } from 'express';
import { UserControllers } from './user.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/me', auth('CUSTOMER', 'RIDER', 'ADMIN', 'MODERATOR'), UserControllers.getMyProfile);
router.patch('/me', auth('CUSTOMER', 'RIDER', 'ADMIN', 'MODERATOR'), UserControllers.updateMyProfile);
router.post('/forgot-password', UserControllers.handleForgotPassword);
router.post('/reset-password', UserControllers.handleResetPassword);
router.get('/my-parcels', auth('CUSTOMER'), UserControllers.getMyParcels);
router.get('/my-payments', auth('CUSTOMER'), UserControllers.getMyPayments);
export const UserRoutes = router;