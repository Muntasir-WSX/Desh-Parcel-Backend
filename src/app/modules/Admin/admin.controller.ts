import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { AdminServices } from './admin.service';
import sendResponse from '../../utils/sendResponse';

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

const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await AdminServices.getAllUsersFromDB(page, limit);
    
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'All users fetched successfully',
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const getAllParcelsForAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await AdminServices.getAllParcelsForAdminFromDB();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'All system parcels fetched successfully',
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};


const deleteParcelByAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parcelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { reason } = req.body;

    const result = await AdminServices.deleteParcelByAdminIntoDB(parcelId as string, reason);
    
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Parcel rejected and deleted successfully by admin',
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

export const AdminControllers = {
  updateUserRole,
  assignParcelToRider,
  getDashboardStats,
  getAllUsers,
  getAllParcelsForAdmin,
  deleteParcelByAdmin,
};