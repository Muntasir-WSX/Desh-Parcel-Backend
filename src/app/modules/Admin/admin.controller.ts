import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { AdminServices } from './admin.service';
import sendResponse from '../../utils/sendResponse';
import { createAuditLog } from '../../utils/auditLog';

const auditRequest = (req: AuthenticatedRequest) => ({
  actorId: req.user?.id,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
});

const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const result = await AdminServices.updateUserRoleIntoDB(
      id as string,
      role,
      String(req.user?.role)
    );
    void createAuditLog({ ...auditRequest(req), action: 'USER_ROLE_UPDATED', resource: 'USER', resourceId: id as string, details: { role } }).catch(console.error);
    res.status(200).json({ success: true, message: 'User role updated successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};
const assignParcelToRider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { parcelId, riderId } = req.body;

    const result = await AdminServices.assignParcelToRiderIntoDB(parcelId, riderId);
    void createAuditLog({ ...auditRequest(req), action: 'PARCEL_ASSIGNED', resource: 'PARCEL', resourceId: parcelId, details: { riderId } }).catch(console.error);
    res.status(200).json({ success: true, message: 'Parcel assigned to rider successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const approveParcel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parcelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await AdminServices.approveParcelIntoDB(parcelId as string);
    void createAuditLog({ ...auditRequest(req), action: 'PARCEL_APPROVED', resource: 'PARCEL', resourceId: parcelId as string }).catch(console.error);
    res.status(200).json({ success: true, message: 'Parcel approved successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const approveRider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const riderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await AdminServices.approveRiderIntoDB(riderId as string);
    void createAuditLog({ ...auditRequest(req), action: 'RIDER_APPROVED', resource: 'USER', resourceId: riderId as string }).catch(console.error);
    res.status(200).json({ success: true, message: 'Rider approved successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const banUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await AdminServices.banUserIntoDB(userId as string);
    void createAuditLog({ ...auditRequest(req), action: 'USER_BANNED', resource: 'USER', resourceId: userId as string }).catch(console.error);
    res.status(200).json({ success: true, message: 'User banned successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

  const updateParcelHubStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parcelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { currentHub, note } = req.body;
      const result = await AdminServices.updateParcelHubStatusIntoDB(parcelId as string, currentHub, note);
      void createAuditLog({ ...auditRequest(req), action: 'PARCEL_HUB_STATUS_UPDATED', resource: 'PARCEL', resourceId: parcelId as string, details: { currentHub } }).catch(console.error);
      res.status(200).json({ success: true, message: 'Parcel hub status updated successfully', data: result });
    } catch (error: any) {
      sendResponse(res, { success: false, statusCode: 400, message: error.message });
    }
  };

const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await AdminServices.getAdminDashboardStatsFromDB();
    res.status(200).json({ success: true, message: 'Dashboard stats fetched successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
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
    void createAuditLog({ ...auditRequest(req), action: 'PARCEL_DELETED', resource: 'PARCEL', resourceId: parcelId as string, details: { reason } }).catch(console.error);
    
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


const getWithdrawalRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await AdminServices.getAllWithdrawalRequestsFromDB();
    sendResponse(res, { success: true, statusCode: 200, message: 'Withdrawal requests fetched successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const handleWithdrawalStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;
    const result = await AdminServices.updateWithdrawalStatusByAdminFromDB(requestId as string, status);
    void createAuditLog({ ...auditRequest(req), action: 'WITHDRAWAL_STATUS_UPDATED', resource: 'WITHDRAWAL_REQUEST', resourceId: requestId as string, details: { status } }).catch(console.error);
    sendResponse(res, { success: true, statusCode: 200, message: `Withdrawal request ${status.toLowerCase()} successfully`, data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await AdminServices.getAuditLogsFromDB(req.query as any);
    sendResponse(res, { success: true, statusCode: 200, message: 'Audit logs fetched successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

export const AdminControllers = {
  updateUserRole,
  assignParcelToRider,
  approveParcel,
  approveRider,
  banUser,
    updateParcelHubStatus,
  getDashboardStats,
  getAllUsers,
  getAllParcelsForAdmin,
  deleteParcelByAdmin,
  getWithdrawalRequests,
  handleWithdrawalStatus,
  getAuditLogs,
};
