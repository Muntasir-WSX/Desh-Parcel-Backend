import { Router } from 'express';
import { UserControllers } from './user.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/me', auth('CUSTOMER', 'RIDER', 'ADMIN', 'MODERATOR'), UserControllers.getMyProfile);
router.post('/forgot-password', UserControllers.handleForgotPassword);
router.post('/reset-password', UserControllers.handleResetPassword);

export const UserRoutes = router;