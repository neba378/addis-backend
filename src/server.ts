import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";

// Import your new routes (to be created)
import clientRoutes from "./routes/clientRoutes";
import folderRoutes from "./routes/folderRoutes";
import fileRoutes from "./routes/fileRoutes";
import noteRoutes from "./routes/noteRoutes";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/adminRoutes";

// Import middleware and utilities
import { errorHandler } from "./middlewares/errorHandler";
import { env, isProduction } from "./config/env"; // Your enhanced env config
import { setupSwagger } from "./config/swagger";
import prisma from "./config/db"; // Your Prisma client
import { superadminService } from "./services/superadmin.service";

const app = express();
const PORT = env.app.port;
setupSwagger(app);
// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: isProduction()
      ? [
          "https://api.addisfirm.com",
          "http://localhost:3001",
          "http://localhost:5173",
          "https://api.addisfirm.com/api-docs", // Add Swagger UI if needed
        ] // Replace with your production domain
      : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:5173",
        ], // Added Vite default port
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.set("trust proxy", true);
// Body parsing middleware
app.use(express.json({ limit: env.upload.maxFileSize + "b" })); // Use your config
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser middleware
app.use(cookieParser(env.security.jwtSecret));

// Serve static files (uploaded files) with proper headers
app.use(
  "/uploads",
  (req, res, next) => {
    // More restrictive in production
    if (isProduction()) {
      res.header("Access-Control-Allow-Origin", "http://localhost:5000");
    } else {
      res.header("Access-Control-Allow-Origin", "*");
    }
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  },
  express.static(path.join(__dirname, "../uploads"))
);

// Health check endpoint with database connection check
app.get("/health", async (_req, res) => {
  try {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
      environment: env.app.nodeEnv,
      documentation: `http://localhost:${PORT}/api-docs`,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: "Database connection failed",
    });
  }
});

// API routes for your office management system
app.use("/api/clients", clientRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/admin", adminRoutes);

// Keep your existing routes if needed, or remove them
app.use("/api/auth", authRoutes); // Keep if you need authentication

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// // Graceful shutdown handling
// process.on("SIGINT", async () => {
//   console.log("Shutting down gracefully...");
//   await prisma.$disconnect();
//   process.exit(0);
// });

// process.on("SIGTERM", async () => {
//   console.log("Shutting down gracefully...");
//   await prisma.$disconnect();
//   process.exit(0);
// });

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${env.app.nodeEnv}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`👥 Clients API: http://localhost:${PORT}/api/clients`);
  console.log(`📁 Folders API: http://localhost:${PORT}/api/folders`);
  console.log(`📂 Files API: http://localhost:${PORT}/api/files`);
  console.log(`📝 Notes API: http://localhost:${PORT}/api/notes`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`💾 Upload directory: ${path.join(__dirname, "../uploads")}`);

  // Start any cleanup services if needed
  // TokenCleanupService.startCleanup();
});

async function init() {
  try {
    await superadminService.createDefaultSuperAdmin();
  } catch (error) {
    console.error("Failed to initialize super admin:", error);
    process.exit(1);
  }
}
init();
export default app;
