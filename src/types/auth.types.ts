import { User, UserRole, Status, Admin, RefreshToken } from "@prisma/client";

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface InviteUserData {
  email: string;
  name: string;
  role: UserRole;
  department?: string | undefined;
  phoneNumber?: string | undefined;
}

export interface ChangePasswordData {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  type: "access" | "refresh";
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export type UserWithTokens = User & {
  refreshTokens?: RefreshToken[];
};

export type AdminWithTokens = Admin & {
  refreshTokens?: RefreshToken[];
};
