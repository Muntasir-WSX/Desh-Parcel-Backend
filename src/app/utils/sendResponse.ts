import { Response } from 'express';

interface IResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: any;
}

const sendResponse = <T>(res: Response, jsonData: IResponse<T>) => {
  res.status(jsonData.statusCode).json({
    success: jsonData.success,
    message: jsonData.message,
    data: jsonData.data || null,
    ...(jsonData.errors && { errors: jsonData.errors }),
  });
};

export default sendResponse;