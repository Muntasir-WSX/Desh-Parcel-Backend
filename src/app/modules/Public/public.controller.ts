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

const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await PublicServices.subscribeNewsletterIntoDB(req.body.email);
    res.status(201).json({ 
      success: true, 
      message: 'Subscribed to newsletter successfully', 
      data: result 
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};



const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await PublicServices.getAllBlogsFromDB();
    sendResponse(res, { success: true, statusCode: 200, message: 'Blogs fetched successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await PublicServices.getBlogByIdFromDB(req.params.id);
    if (!result) {
      sendResponse(res, { success: false, statusCode: 404, message: 'Blog not found' });
      return;
    }
    sendResponse(res, { success: true, statusCode: 200, message: 'Blog fetched successfully', data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};


export const PublicControllers = {
  getReviews,
    subscribeNewsletter,
    getAllBlogs,
    getBlogById,
};