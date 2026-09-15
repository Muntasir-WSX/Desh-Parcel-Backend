import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { UserServices } from './user.service';

const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await UserServices.getUserProfileFromDB(userId!);
    res.status(200).json({ success: true, message: "Profile fetched successfully", data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const handleForgotPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await UserServices.forgotPassword(email);
    res.status(200).json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const handleResetPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await UserServices.resetPassword(req.body);
    res.status(200).json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const UserControllers = {
  getMyProfile,
  handleForgotPassword,
  handleResetPassword,
};