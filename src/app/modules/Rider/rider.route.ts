import { Router } from 'express';
import { RiderControllers } from './rider.controller';
import auth from '../../middlewares/auth';

const router = Router();


router.get('/assigned-parcels', auth('RIDER'), RiderControllers.getMyAssignedParcels);
router.get('/assigned-parcels/:id', auth('RIDER'), RiderControllers.getSingleAssignedParcel);
router.patch('/parcels/:id/status', auth('RIDER'), RiderControllers.updateParcelStatus);

export const RiderRoutes = router;