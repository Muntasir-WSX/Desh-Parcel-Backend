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
    ...(jsonData.success
      ? { data: jsonData.data ?? null }
      : { errors: jsonData.errors ?? [{ path: '', message: jsonData.message }] }),
  });
};

export default sendResponse;