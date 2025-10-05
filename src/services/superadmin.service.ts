import bcrypt from "bcryptjs";
import prisma from "../config/db";
import { UserRole, Status } from "@prisma/client";

export const superadminService = {
  async createDefaultSuperAdmin() {
    try {
      // Use environment variables or defaults
      const defaultEmail =
        process.env.SUPERADMIN_EMAIL || "superadmin@example.com";
      const defaultPassword =
        process.env.SUPERADMIN_PASSWORD || "SuperAdmin123!";
      const defaultName = process.env.SUPERADMIN_NAME || "Super Administrator";
      const shouldCreate = process.env.CREATE_DEFAULT_SUPERADMIN !== "false";

      if (!shouldCreate) {
        console.log("ℹ️  Default Super Admin creation is disabled");
        return { exists: true, created: false };
      }

      // Check if super admin already exists
      const existingSuperAdmin = await prisma.user.findFirst({
        where: {
          email: defaultEmail,
          role: UserRole.SUPER_ADMIN,
        },
      });

      if (existingSuperAdmin) {
        console.log("✅ Super Admin already exists");
        return { exists: true, user: existingSuperAdmin, created: false };
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);

      // Create super admin
      const superAdmin = await prisma.user.create({
        data: {
          name: defaultName,
          email: defaultEmail,
          password: hashedPassword,
          role: UserRole.SUPER_ADMIN,
          status: Status.ACTIVE,
          department: "Administration",
          phoneNumber: "+1234567890",
        },
      });

      console.log("✅ Default Super Admin created successfully");
      console.log("📧 Email:", defaultEmail);
      console.log("🔑 Password:", defaultPassword);
      console.log("⚠️  Please change the password after first login!");

      return {
        exists: false,
        user: superAdmin,
        created: true,
        tempPassword: defaultPassword,
      };
    } catch (error) {
      console.error("❌ Failed to create default Super Admin:", error);
      throw error;
    }
  },
};
