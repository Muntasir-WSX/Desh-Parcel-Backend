import { Router } from 'express';
import { AdminControllers } from './admin.controller';
import auth from '../../middlewares/auth';

const router = Router();


router.patch('/users/:id/role', auth('ADMIN'), AdminControllers.updateUserRole);
router.patch('/users/:id/ban', auth('ADMIN'), AdminControllers.banUser);
router.patch('/riders/:id/approve', auth('ADMIN', 'MODERATOR'), AdminControllers.approveRider);
router.patch('/parcels/:id/approve', auth('ADMIN', 'MODERATOR'), AdminControllers.approveParcel);
router.patch('/parcels/:id/hub-status', auth('ADMIN', 'MODERATOR'), AdminControllers.updateParcelHubStatus);
router.post('/parcels/assign', auth('ADMIN', 'MODERATOR'), AdminControllers.assignParcelToRider);
router.get('/dashboard-stats', auth('ADMIN'), AdminControllers.getDashboardStats);
router.get('/users', auth('ADMIN'), AdminControllers.getAllUsers);
router.get('/parcels', auth('ADMIN'), AdminControllers.getAllParcelsForAdmin);
router.delete('/parcels/:id', auth('ADMIN', 'MODERATOR'), AdminControllers.deleteParcelByAdmin);
router.get('/withdrawal-requests', auth('ADMIN'), AdminControllers.getWithdrawalRequests);
router.patch('/withdrawal-requests/:id/status', auth('ADMIN'), AdminControllers.handleWithdrawalStatus);
export const AdminRoutes = router;