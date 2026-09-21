import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';

const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await UserServices.getUserProfileFromDB(userId!);
    res.status(200).json({ success: true, message: "Profile fetched successfully", data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const updateMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await UserServices.updateMyProfileIntoDB(userId!, req.body);
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const getMyParcels = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await UserServices.getUserParcelsFromDB(req.user?.id!);
    res.status(200).json({ success: true, message: 'Your parcels fetched successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const getMyPayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await UserServices.getUserPaymentHistoryFromDB(req.user?.id!);
    res.status(200).json({ success: true, message: 'Your payment history fetched successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const handleForgotPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await UserServices.forgotPassword(email);
    res.status(200).json({ success: true, message: result.message });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const handleResetPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await UserServices.resetPassword(req.body);
    res.status(200).json({ success: true, message: result.message });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

export const UserControllers = {
  getMyProfile,
  updateMyProfile,
  handleForgotPassword,
  handleResetPassword,
  getMyParcels,
  getMyPayments,
};