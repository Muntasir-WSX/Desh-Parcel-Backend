import { Router } from 'express';
import { RiderControllers } from './rider.controller';
import auth from '../../middlewares/auth';

const router = Router();


router.get('/assigned-parcels', auth('RIDER'), RiderControllers.getMyAssignedParcels);
router.get('/assigned-parcels/:id', auth('RIDER'), RiderControllers.getSingleAssignedParcel);
router.patch('/parcels/:id/status', auth('RIDER'), RiderControllers.updateParcelStatus);
router.post('/parcels/:id/deliver', auth('RIDER'), RiderControllers.verifyDeliveryOtp);
router.get('/profile-earnings', auth('RIDER'), RiderControllers.getRiderProfileAndEarnings);
router.get('/earnings-report', auth('RIDER'), RiderControllers.getRiderEarningsReport);
router.post('/cashout', auth('RIDER'), RiderControllers.requestCashout);
export const RiderRoutes = router;