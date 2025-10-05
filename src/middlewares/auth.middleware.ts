import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { errorResponse } from "../utils/response";
import { UserRole } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Access token required", 401);
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const decoded = authService.verifyToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return errorResponse(res, "Invalid or expired token", 401);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, "Authentication required", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, "Insufficient permissions", 403);
    }

    next();
  };
};

// Specific role middleware helpers
export const requireSuperAdmin = authorize(UserRole.SUPER_ADMIN);
export const requireManager = authorize(UserRole.MANAGER);
export const requireLawyer = authorize(UserRole.LAWYER);
export const requireManagerOrSuperAdmin = authorize(
  UserRole.MANAGER,
  UserRole.SUPER_ADMIN
);
