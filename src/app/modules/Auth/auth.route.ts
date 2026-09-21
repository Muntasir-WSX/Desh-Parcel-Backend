import { Router } from 'express';
import { AuthControllers } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';

const router = Router();

router.post('/register', validateRequest(AuthValidation.registerSchema), AuthControllers.registerUser);
router.post('/login', validateRequest(AuthValidation.loginSchema), AuthControllers.loginUser);
router.post('/google', validateRequest(AuthValidation.googleLoginSchema), AuthControllers.loginWithGoogle);

export const AuthRoutes = router; 