import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { AdminServices } from './admin.service';

const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const result = await AdminServices.updateUserRoleIntoDB(id as string, role);
    res.status(200).json({ success: true, message: 'User role updated successfully', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const assignParcelToRider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { parcelId, riderId } = req.body;

    const result = await AdminServices.assignParcelToRiderIntoDB(parcelId, riderId);
    res.status(200).json({ success: true, message: 'Parcel assigned to rider successfully', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await AdminServices.getAdminDashboardStatsFromDB();
    res.status(200).json({ success: true, message: 'Dashboard stats fetched successfully', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const AdminControllers = {
  updateUserRole,
  assignParcelToRider,
  getDashboardStats,
};