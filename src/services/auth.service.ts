import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import prisma from "../config/db";
import {
  LoginData,
  AuthTokens,
  InviteUserData,
  ChangePasswordData,
  ResetPasswordData,
  JwtPayload,
} from "../types/auth.types";
import { UserRole, Status } from "@prisma/client";
import { emailService } from "./email.service";

export const authService = {
  // Generate JWT tokens
  generateTokens(payload: Omit<JwtPayload, "type">): AuthTokens {
    const accessToken = jwt.sign(
      { ...payload, type: "access" },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  },

  // Verify JWT token
  verifyToken(token: string, isRefresh = false): JwtPayload {
    try {
      const secret = isRefresh
        ? process.env.JWT_REFRESH_SECRET!
        : process.env.JWT_SECRET!;
      return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      throw new Error("Invalid token");
    }
  },

  // Login user
  async login(data: LoginData) {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if user is active
    if (user.status === Status.INACTIVE) {
      throw new Error("Account is not active. Please contact administrator.");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department,
        phoneNumber: user.phoneNumber,
        lastLogin: user.lastLogin,
      },
      tokens,
    };
  },

  // Invite user (for super admin and manager)
  async inviteUser(inviterId: string, data: InviteUserData) {
    const { email, name, role, department, phoneNumber } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Generate temporary password
    const tempPassword = randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        department: department ?? null,
        phoneNumber: phoneNumber ?? null,
        status: Status.PENDING,
      },
    });

    // Send invitation email
    await emailService.sendInvitationEmail(email, name, tempPassword);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      tempPassword, // Return temp password for reference (do not log in production)
    };
  },

  // Change password
  async changePassword(data: ChangePasswordData) {
    const { userId, currentPassword, newPassword } = data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password and activate account if it was pending
    const updateData: any = {
      password: hashedNewPassword,
    };

    if (user.status === Status.PENDING) {
      updateData.status = Status.ACTIVE;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return { message: "Password changed successfully" };
  },

  // Forgot password
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal whether user exists
      return { message: "If the email exists, a reset link will be sent" };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token (you might want to create a separate table for this)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // For simplicity, we're storing in password reset field
        // In production, consider a separate PasswordReset model
        password: user.password, // This would need to be adjusted
      },
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(email, user.name, resetToken);

    return { message: "If the email exists, a reset link will be sent" };
  },

  // Reset password
  async resetPassword(data: ResetPasswordData) {
    const { token, newPassword } = data;

    // In production, verify the token from your storage
    // For now, this is a simplified implementation
    const user = await prisma.user.findFirst({
      where: {
        // You would check against your reset token storage
        // This is a placeholder implementation
        email: { contains: "" }, // Adjust based on your token verification logic
      },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return { message: "Password reset successfully" };
  },

  // Refresh token
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = this.verifyToken(refreshToken, true);

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || user.status !== Status.ACTIVE) {
        throw new Error("User not found or inactive");
      }

      // Generate new tokens
      const tokens = this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  },

  // Get user profile
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: true,
        phoneNumber: true,
        lastLogin: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  // Update user profile
  async updateProfile(userId: string, data: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: true,
        phoneNumber: true,
        lastLogin: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  },

  // Get all users (for managers and super admins)
  async getAllUsers(requesterRole: UserRole) {
    let whereCondition = {};

    // Managers can only see lawyers, super admins can see everyone
    if (requesterRole === UserRole.MANAGER) {
      whereCondition = {
        role: UserRole.LAWYER,
      };
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: true,
        phoneNumber: true,
        lastLogin: true,
        joinedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  },

  // Update user status (for managers and super admins)
  async updateUserStatus(
    userId: string,
    status: Status,
    requesterRole: UserRole
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Managers can only update lawyers
    if (requesterRole === UserRole.MANAGER && user.role !== UserRole.LAWYER) {
      throw new Error("Unauthorized to update this user");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: true,
        phoneNumber: true,
      },
    });

    return updatedUser;
  },
};
