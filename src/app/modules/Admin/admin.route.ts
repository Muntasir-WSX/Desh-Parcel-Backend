import { Router } from 'express';
import { AdminControllers } from './admin.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';

const router = Router();


router.patch('/users/:id/role', auth('ADMIN'), validateRequest(AdminValidation.roleSchema), AdminControllers.updateUserRole);
router.patch('/users/:id/ban', auth('ADMIN'), validateRequest(AdminValidation.idParams), AdminControllers.banUser);
router.patch('/riders/:id/approve', auth('ADMIN', 'MODERATOR'), validateRequest(AdminValidation.idParams), AdminControllers.approveRider);
router.patch('/parcels/:id/approve', auth('ADMIN', 'MODERATOR'), validateRequest(AdminValidation.idParams), AdminControllers.approveParcel);
router.patch('/parcels/:id/hub-status', auth('ADMIN', 'MODERATOR'), validateRequest(AdminValidation.hubStatusSchema), AdminControllers.updateParcelHubStatus);
router.post('/parcels/assign', auth('ADMIN', 'MODERATOR'), validateRequest(AdminValidation.assignSchema), AdminControllers.assignParcelToRider);
router.get('/dashboard-stats', auth('ADMIN'), AdminControllers.getDashboardStats);
router.get('/users', auth('ADMIN'), validateRequest(AdminValidation.paginationSchema), AdminControllers.getAllUsers);
router.get('/parcels', auth('ADMIN'), AdminControllers.getAllParcelsForAdmin);
router.delete('/parcels/:id', auth('ADMIN', 'MODERATOR'), validateRequest(AdminValidation.deleteParcelSchema), AdminControllers.deleteParcelByAdmin);
router.get('/withdrawal-requests', auth('ADMIN'), AdminControllers.getWithdrawalRequests);
router.patch('/withdrawal-requests/:id/status', auth('ADMIN'), validateRequest(AdminValidation.withdrawalStatusSchema), AdminControllers.handleWithdrawalStatus);
export const AdminRoutes = router;