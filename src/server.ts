import swaggerUi from "swagger-ui-express";
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
import appointmentRoutes from "./routes/appointmentRoutes";

// Import middleware and utilities
import { errorHandler } from "./middlewares/errorHandler";
import { env, isProduction } from "./config/env"; // Your enhanced env config
import { superadminService } from "./services/superadmin.service";
import { specs } from "./config/swagger";

const app = express();
const PORT = env.app.port;

// Setup Swagger for API documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #2563eb }
        .swagger-ui .btn.authorize { background-color: #2563eb; border-color: #2563eb }
      `,
    customSiteTitle: "Addis Digital API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  })
);

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
        ] // Replace with your production domain
      : [
          "https://api.addisfirm.com",
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
app.use(express.json()); // Use your config
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser(env.security.jwtSecret));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
app.use("/api/appointments", appointmentRoutes);

//test route for ci cd
app.get("/cicd", (req, res) => {
  res.send("CI CD is working fine");
});

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
