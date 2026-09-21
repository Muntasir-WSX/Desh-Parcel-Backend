import { Router } from 'express';
import { PaymentControllers } from './payment.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';

const router = Router();


router.post('/bkash/initiate', auth('CUSTOMER', 'ADMIN'), validateRequest(PaymentValidation.parcelBodySchema), PaymentControllers.initiateBkashPayment);
router.get('/bkash/callback', validateRequest(PaymentValidation.bkashCallbackSchema), PaymentControllers.bkashCallback);


router.post('/ssl/initiate', auth('CUSTOMER', 'ADMIN'), validateRequest(PaymentValidation.parcelBodySchema), PaymentControllers.initiateSslPayment);
router.get('/ssl/success', validateRequest(PaymentValidation.sslSuccessSchema), PaymentControllers.sslSuccess);
router.post('/ssl/fail', validateRequest(PaymentValidation.sslResultSchema), PaymentControllers.sslFail);
router.post('/ssl/cancel', validateRequest(PaymentValidation.sslResultSchema), PaymentControllers.sslCancel);
router.post('/ssl/ipn', PaymentControllers.sslIpn);
router.get('/:parcelId', auth('CUSTOMER', 'ADMIN', 'RIDER'), validateRequest(PaymentValidation.parcelParamsSchema), PaymentControllers.getPaymentStatusByParcelId);

export const PaymentRoutes = router;