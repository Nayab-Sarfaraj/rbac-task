import { Response } from 'express';

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: any;
}

export const successResponse = <T>(res: Response, statusCode: number, message: string, data: T): Response => {
  const body: SuccessResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(body);
};

export const errorResponse = (res: Response, statusCode: number, message: string, error: any = null): Response => {
  const body: ErrorResponse = {
    success: false,
    message,
    error: error || undefined,
  };
  return res.status(statusCode).json(body);
};
