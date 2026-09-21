import { Router } from 'express';
import { AuthControllers } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';

const router = Router();

router.post('/register', validateRequest(AuthValidation.registerSchema), AuthControllers.registerUser);
router.post('/login', validateRequest(AuthValidation.loginSchema), AuthControllers.loginUser);

export const AuthRoutes = router; 