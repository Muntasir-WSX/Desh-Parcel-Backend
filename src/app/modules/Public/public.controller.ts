import { Request, Response } from 'express';
import { PublicServices } from './public.service';
import sendResponse from '../../utils/sendResponse';

const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await PublicServices.getAllReviewsFromDB();
    sendResponse(res, { success: true, statusCode: 200, message: 'Reviews fetched successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

export const PublicControllers = {
  getReviews,
};