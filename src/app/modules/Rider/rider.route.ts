import { Router } from 'express';
import { RiderControllers } from './rider.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RiderValidation } from './rider.validation';

const router = Router();


router.get('/assigned-parcels', auth('RIDER'), RiderControllers.getMyAssignedParcels);
router.get('/assigned-parcels/:id', auth('RIDER'), validateRequest(RiderValidation.idParams), RiderControllers.getSingleAssignedParcel);
router.patch('/parcels/:id/status', auth('RIDER'), validateRequest(RiderValidation.statusSchema), RiderControllers.updateParcelStatus);
router.post('/parcels/:id/deliver', auth('RIDER'), validateRequest(RiderValidation.deliverySchema), RiderControllers.verifyDeliveryOtp);
router.get('/profile-earnings', auth('RIDER'), RiderControllers.getRiderProfileAndEarnings);
router.get('/earnings-report', auth('RIDER'), RiderControllers.getRiderEarningsReport);
router.post('/cashout', auth('RIDER'), validateRequest(RiderValidation.cashoutSchema), RiderControllers.requestCashout);
export const RiderRoutes = router;