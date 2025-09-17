import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | undefined;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Success response without pagination
export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

// Success response with pagination
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: PaginatedResponse<T>["pagination"],
  message: string = "Success",
  statusCode: number = 200
): void => {
  const response: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    message,
    data: {
      data,
      pagination,
    },
  };
  res.status(statusCode).json(response);
};

// Error response
export const errorResponse = (
  res: Response,
  message: string = "Error",
  statusCode: number = 500,
  error?: string
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  res.status(statusCode).json(response);
};

// Not found response
export const notFoundResponse = (
  res: Response,
  resource: string = "Resource"
): void => {
  errorResponse(res, `${resource} not found`, 404);
};

// Validation error response
export const validationErrorResponse = (
  res: Response,
  errors: string[]
): void => {
  errorResponse(res, "Validation failed", 400, errors.join(", "));
};

// Unauthorized response
export const unauthorizedResponse = (
  res: Response,
  message: string = "Unauthorized"
): void => {
  errorResponse(res, message, 401);
};

// Forbidden response
export const forbiddenResponse = (
  res: Response,
  message: string = "Forbidden"
): void => {
  errorResponse(res, message, 403);
};
