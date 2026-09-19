import { Router } from 'express';
import { AdminControllers } from './admin.controller';
import auth from '../../middlewares/auth';

const router = Router();


router.patch('/users/:id/role', auth('ADMIN'), AdminControllers.updateUserRole);
router.post('/parcels/assign', auth('ADMIN'), AdminControllers.assignParcelToRider);
router.get('/dashboard-stats', auth('ADMIN'), AdminControllers.getDashboardStats);
router.get('/users', auth('ADMIN'), AdminControllers.getAllUsers);
router.get('/parcels', auth('ADMIN'), AdminControllers.getAllParcelsForAdmin);
router.delete('/parcels/:id', auth('ADMIN'), AdminControllers.deleteParcelByAdmin);
export const AdminRoutes = router;