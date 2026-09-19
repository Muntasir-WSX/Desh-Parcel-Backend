import { Router } from 'express';
import { PaymentControllers } from './payment.controller';
import auth from '../../middlewares/auth';

const router = Router();


router.post('/bkash/initiate', auth('CUSTOMER', 'ADMIN'), PaymentControllers.initiateBkashPayment);
router.get('/bkash/callback', PaymentControllers.bkashCallback);


router.post('/ssl/initiate', auth('CUSTOMER', 'ADMIN'), PaymentControllers.initiateSslPayment);
router.get('/ssl/success', PaymentControllers.sslSuccess);
router.post('/ssl/fail', PaymentControllers.sslFail);
router.post('/ssl/cancel', PaymentControllers.sslCancel);

export const PaymentRoutes = router;