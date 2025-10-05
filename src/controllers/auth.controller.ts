import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../utils/response";
import {
  LoginInput,
  InviteUserInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  RefreshTokenInput,
  UpdateProfileInput,
  UserIdParams,
} from "../validations/auth.validation";
import { AuthRequest } from "../middlewares/auth.middleware";
import { UserRole, Status } from "@prisma/client";

export const authController = {
  // Login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as LoginInput;

      const result = await authService.login({ email, password });

      successResponse(res, result, "Login successful");
    } catch (error: any) {
      errorResponse(res, error.message, 401);
    }
  },

  // Invite user (Super Admin and Manager only)
  async inviteUser(req: AuthRequest, res: Response) {
    try {
      const inviterId = req.user!.id;
      const data = req.body as InviteUserInput;

      // Check permissions
      if (
        req.user!.role === UserRole.MANAGER &&
        data.role !== UserRole.LAWYER
      ) {
        return errorResponse(res, "Managers can only invite lawyers", 403);
      }

      const user = await authService.inviteUser(inviterId, data);

      successResponse(res, user, "User invited successfully", 201);
    } catch (error: any) {
      errorResponse(res, "Failed to invite user", 400, error.message);
    }
  },

  // Change password
  async changePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body as ChangePasswordInput;

      const result = await authService.changePassword({
        userId,
        currentPassword,
        newPassword,
      });

      successResponse(res, result, "Password changed successfully");
    } catch (error: any) {
      errorResponse(res, "Failed to change password", 400, error.message);
    }
  },

  // Forgot password
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body as ForgotPasswordInput;

      const result = await authService.forgotPassword(email);

      successResponse(res, result, "Reset instructions sent if email exists");
    } catch (error: any) {
      errorResponse(res, "Failed to process request", 500, error.message);
    }
  },

  // Reset password
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body as ResetPasswordInput;

      const result = await authService.resetPassword({ token, newPassword });

      successResponse(res, result, "Password reset successfully");
    } catch (error: any) {
      errorResponse(res, "Failed to reset password", 400, error.message);
    }
  },

  // Refresh token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;

      const result = await authService.refreshToken(refreshToken);

      successResponse(res, result, "Token refreshed successfully");
    } catch (error: any) {
      errorResponse(res, "Failed to refresh token", 401, error.message);
    }
  },

  // Get profile
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const profile = await authService.getProfile(userId);

      successResponse(res, profile, "Profile retrieved successfully");
    } catch (error: any) {
      if (error.message === "User not found") {
        return notFoundResponse(res, "User");
      }
      errorResponse(res, "Failed to retrieve profile", 500, error.message);
    }
  },

  // Update profile
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = req.body as UpdateProfileInput;

      const profile = await authService.updateProfile(userId, data);

      successResponse(res, profile, "Profile updated successfully");
    } catch (error: any) {
      if (error.message === "User not found") {
        return notFoundResponse(res, "User");
      }
      errorResponse(res, "Failed to update profile", 500, error.message);
    }
  },

  // Get all users (Manager and Super Admin only)
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const requesterRole = req.user!.role;

      const users = await authService.getAllUsers(requesterRole);

      successResponse(res, users, "Users retrieved successfully");
    } catch (error: any) {
      errorResponse(res, "Failed to retrieve users", 500, error.message);
    }
  },

  // Update user status (Manager and Super Admin only)
  async updateUserStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as unknown as UserIdParams;
      const { status } = req.body;
      const requesterRole = req.user!.role;

      // Validate status
      if (!Object.values(Status).includes(status)) {
        return errorResponse(res, "Invalid status", 400);
      }

      const user = await authService.updateUserStatus(
        id,
        status,
        requesterRole
      );

      successResponse(res, user, "User status updated successfully");
    } catch (error: any) {
      if (error.message === "User not found") {
        return notFoundResponse(res, "User");
      }
      errorResponse(res, "Failed to update user status", 400, error.message);
    }
  },

  // Logout (client-side token disposal)
  async logout(req: AuthRequest, res: Response) {
    try {
      // Since we're using stateless JWT, logout is handled client-side
      // by removing the token. For server-side logout, you might want to
      // maintain a blacklist of tokens.
      successResponse(res, null, "Logout successful");
    } catch (error: any) {
      errorResponse(res, "Failed to logout", 500, error.message);
    }
  },
};
