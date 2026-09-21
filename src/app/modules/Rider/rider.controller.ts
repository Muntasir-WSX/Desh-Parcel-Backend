import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { RiderServices } from './rider.service';
import { ParcelServices } from '../Percel/percel.service';
import sendResponse from '../../utils/sendResponse';
import { createAuditLog } from '../../utils/auditLog';

const getMyAssignedParcels = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.id;
    const result = await RiderServices.getRiderAssignedParcelsFromDB(riderId!);
    res.status(200).json({ success: true, message: 'Assigned parcels fetched successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const getSingleAssignedParcel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.id;
    const parcelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const result = await RiderServices.getParcelByIdForRiderFromDB(riderId!, parcelId as string);
    res.status(200).json({ success: true, message: 'Parcel details fetched successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 404, message: error.message });
  }
};


const getRiderProfileAndEarnings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.id;
    const result = await RiderServices.getRiderProfileAndEarningsFromDB(riderId!);
    sendResponse(res, { success: true, statusCode: 200, message: 'Rider profile & earnings fetched', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const requestCashout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.id;
    const { amount, bkashNo } = req.body;
    const result = await RiderServices.requestCashoutByRiderFromDB(riderId!, amount, bkashNo);
    void createAuditLog({ actorId: riderId, action: 'CASHOUT_REQUESTED', resource: 'WITHDRAWAL_REQUEST', resourceId: result.id, details: { amount } }).catch(console.error);
    sendResponse(res, { success: true, statusCode: 200, message: 'Cashout request submitted successfully via bKash', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const verifyDeliveryOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.id;
    const parcelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await ParcelServices.verifyAndDeliverParcel(
      riderId!,
      parcelId as string,
      req.body.otp
    );
    void createAuditLog({ actorId: riderId, action: 'PARCEL_DELIVERED', resource: 'PARCEL', resourceId: parcelId as string }).catch(console.error);
    res.status(200).json({ success: true, message: 'Parcel delivered successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const updateParcelStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.id;
    const parcelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status, note } = req.body;

    const result = await RiderServices.updateParcelStatusByRiderFromDB(
      riderId!,
      parcelId as string,
      status,
      note
    );
    void createAuditLog({ actorId: riderId, action: 'PARCEL_STATUS_UPDATED', resource: 'PARCEL', resourceId: parcelId as string, details: { status, note } }).catch(console.error);
    res.status(200).json({ success: true, message: `Parcel status updated to ${status} successfully`, data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};




const getRiderEarningsReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await RiderServices.getRiderEarningsReportFromDB(req.user?.id!);
    sendResponse(res, { success: true, statusCode: 200, message: 'Rider earnings report fetched', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

export const RiderControllers = {
  getMyAssignedParcels,
  getSingleAssignedParcel,
  getRiderProfileAndEarnings,
  requestCashout,
  verifyDeliveryOtp,
  updateParcelStatus,
  getRiderEarningsReport,
};