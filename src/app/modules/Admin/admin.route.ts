import { Router } from 'express';
import { AdminControllers } from './admin.controller';
import auth from '../../middlewares/auth';

const router = Router();


router.patch('/users/:id/role', auth('ADMIN'), AdminControllers.updateUserRole);
router.post('/parcels/assign', auth('ADMIN'), AdminControllers.assignParcelToRider);
router.get('/dashboard-stats', auth('ADMIN'), AdminControllers.getDashboardStats);

export const AdminRoutes = router;