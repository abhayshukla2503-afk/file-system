import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: string;
}

export interface PaginatedResponseMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginatedResponseMeta;
}

/**
 * Sends a standardized success API response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
};

/**
 * Sends a standardized paginated success API response
 */
export const sendPaginatedSuccess = <T>(
  res: Response,
  items: T[],
  meta: PaginatedResponseMeta,
  message?: string,
  statusCode = 200,
): Response => {
  const payload: ApiPaginatedResponse<T> = {
    success: true,
    message,
    data: items,
    meta,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
};
