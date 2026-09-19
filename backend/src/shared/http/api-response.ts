import type { Response } from 'express';

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  data: null;
  errors: readonly ApiFieldError[];
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string,
  statusCode = 200,
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  } satisfies ApiSuccess<T>);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number,
  errors: readonly ApiFieldError[] = [],
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
  } satisfies ApiFailure);
};
