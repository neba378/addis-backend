import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL"];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export const env = {
  // Database (using your existing structure)
  database: {
    url:
      process.env["DATABASE_URL"] ||
      "mysql://root:password@mysql:3306/addis_db",
    host: process.env["DB_HOST"] || "mysql",
    port: parseInt(process.env["DB_PORT"] || "3306"),
    username: process.env["DB_USERNAME"] || "root",
    password: process.env["DB_PASSWORD"] || "password",
    name: process.env["DB_NAME"] || "addis_db",
  },

  // Server
  app: {
    port: parseInt(process.env["PORT"] || "5000"),
    nodeEnv: process.env["NODE_ENV"] || "development",
    apiPrefix: process.env["API_PREFIX"] || "/api",
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env["MAX_FILE_SIZE"] || "10485760"), // 10MB
    allowedMimeTypes: process.env["ALLOWED_MIME_TYPES"]?.split(",") || [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    uploadPath: process.env["UPLOAD_PATH"] || "uploads",
  },

  // Security
  security: {
    jwtSecret:
      process.env["JWT_SECRET"] || "your-fallback-secret-change-in-production",
    bcryptRounds: parseInt(process.env["BCRYPT_ROUNDS"] || "12"),
  },
};

// Type exports for better TypeScript support
export type AppConfig = typeof env.app;
export type DatabaseConfig = typeof env.database;
export type UploadConfig = typeof env.upload;
export type SecurityConfig = typeof env.security;

// Helper functions
export const isProduction = () => env.app.nodeEnv === "production";
export const isDevelopment = () => env.app.nodeEnv === "development";
export const isTest = () => env.app.nodeEnv === "test";

export default env;
