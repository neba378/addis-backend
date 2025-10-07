import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Addis Digital Office Management System API",
      version: "1.0.0",
      description:
        "Comprehensive API documentation for the Addis Digital Office Management System with Role-Based Access Control (RBAC)",
      contact: {
        name: "API Support",
        email: "support@addisfirm.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.app.port}/api`,
        description: "Development server",
      },
      {
        url: "https://api.addisfirm.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token in the format: Bearer <token>",
        },
      },
      schemas: {
        // User and Authentication Schemas
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User ID",
              example: "clabc123def456ghi789jkl012",
            },
            name: {
              type: "string",
              description: "User full name",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "john.doe@example.com",
            },
            role: {
              type: "string",
              enum: ["LAWYER", "MANAGER", "SUPER_ADMIN"],
              description: "User role",
              example: "LAWYER",
            },
            status: {
              type: "string",
              enum: ["PENDING", "ACTIVE", "INACTIVE"],
              description: "User account status",
              example: "ACTIVE",
            },
            department: {
              type: "string",
              description: "User department",
              example: "Legal",
              nullable: true,
            },
            phoneNumber: {
              type: "string",
              description: "User phone number",
              example: "+1234567890",
              nullable: true,
            },
            lastLogin: {
              type: "string",
              format: "date-time",
              description: "Last login timestamp",
              example: "2024-01-15T10:30:00Z",
              nullable: true,
            },
            joinedAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
              example: "2024-01-01T00:00:00Z",
            },
          },
        },

        AuthTokens: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              description: "JWT access token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              description: "JWT refresh token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            expiresIn: {
              type: "integer",
              description: "Access token expiration time in seconds",
              example: 900,
            },
          },
        },

        LoginResponse: {
          type: "object",
          properties: {
            user: {
              $ref: "#/components/schemas/User",
            },
            tokens: {
              $ref: "#/components/schemas/AuthTokens",
            },
          },
        },

        // Client Schemas
        Client: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Client ID",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            fullName: {
              type: "string",
              description: "Client full name",
              example: "John Doe",
              maxLength: 100,
            },
            caseNumber: {
              type: "string",
              description: "Unique case number",
              example: "CASE-2024-001",
              maxLength: 50,
            },
            status: {
              type: "string",
              description: "Client status",
              example: "Pending",
              default: "Pending",
            },
            phoneNumber: {
              type: "string",
              description: "Client phone number",
              example: "+1234567890",
              maxLength: 15,
            },
            appointmentDate: {
              type: "string",
              format: "date-time",
              description: "Appointment date and time",
              example: "2024-01-15T10:30:00Z",
              nullable: true,
            },
            assignedLawyerId: {
              type: "string",
              description: "ID of the assigned lawyer",
              example: "clabc123def456ghi789jkl012",
              nullable: true,
            },
            court: {
              type: "string",
              description: "Court information",
              example: "Federal Court",
              maxLength: 100,
              nullable: true,
            },
            createdBy: {
              type: "string",
              description: "User who created the client",
              example: "admin-user-id",
            },
            notes: {
              type: "string",
              description: "Additional notes",
              example: "Important client with special requirements",
              maxLength: 2000,
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Client creation timestamp",
              example: "2024-01-15T10:30:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Client last update timestamp",
              example: "2024-01-15T10:30:00Z",
            },
          },
        },

        ClientWithRelations: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            fullName: {
              type: "string",
              example: "John Doe",
            },
            caseNumber: {
              type: "string",
              example: "CASE-2024-001",
            },
            status: {
              type: "string",
              example: "Pending",
            },
            phoneNumber: {
              type: "string",
              example: "+1234567890",
            },
            appointmentDate: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
              nullable: true,
            },
            assignedLawyerId: {
              type: "string",
              example: "clabc123def456ghi789jkl012",
              nullable: true,
            },
            court: {
              type: "string",
              example: "Federal Court",
              nullable: true,
            },
            createdBy: {
              type: "string",
              example: "admin-user-id",
            },
            notes: {
              type: "string",
              example: "Important client with special requirements",
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
            },
            assignedLawyer: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  example: "clabc123def456ghi789jkl012",
                },
                name: {
                  type: "string",
                  example: "Sarah Johnson",
                },
                email: {
                  type: "string",
                  example: "sarah.johnson@example.com",
                },
              },
              nullable: true,
            },
            folders: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Folder",
              },
            },
            clientNotes: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Note",
              },
            },
          },
        },

        // Folder Schemas
        Folder: {
          type: "object",
          required: ["name", "clientId"],
          properties: {
            id: {
              type: "string",
              description: "Folder ID",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            name: {
              type: "string",
              description: "Folder name",
              example: "Contracts",
              maxLength: 100,
            },
            description: {
              type: "string",
              description: "Folder description",
              example: "Legal contracts and agreements",
              maxLength: 500,
              nullable: true,
            },
            type: {
              type: "string",
              description: "Folder type (default or custom)",
              enum: ["default", "custom"],
              example: "default",
              default: "custom",
            },
            clientId: {
              type: "string",
              description: "ID of the client this folder belongs to",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Folder creation timestamp",
              example: "2024-01-15T10:30:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Folder last update timestamp",
              example: "2024-01-15T10:30:00Z",
            },
          },
        },

        FolderWithClient: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            name: {
              type: "string",
              example: "Contracts",
            },
            description: {
              type: "string",
              example: "Legal contracts and agreements",
              nullable: true,
            },
            type: {
              type: "string",
              example: "default",
            },
            clientId: {
              type: "string",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
            },
            client: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  example: "123e4567-e89b-12d3-a456-426614174000",
                },
                fullName: {
                  type: "string",
                  example: "John Doe",
                },
                caseNumber: {
                  type: "string",
                  example: "CASE-2024-001",
                },
              },
            },
          },
        },

        FolderWithFiles: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            name: {
              type: "string",
              example: "Contracts",
            },
            description: {
              type: "string",
              example: "Legal contracts and agreements",
              nullable: true,
            },
            type: {
              type: "string",
              example: "default",
            },
            clientId: {
              type: "string",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
            },
            files: {
              type: "array",
              items: {
                $ref: "#/components/schemas/File",
              },
            },
            client: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  example: "123e4567-e89b-12d3-a456-426614174000",
                },
                fullName: {
                  type: "string",
                  example: "John Doe",
                },
                caseNumber: {
                  type: "string",
                  example: "CASE-2024-001",
                },
              },
            },
          },
        },

        // File Schemas
        File: {
          type: "object",
          required: ["fileName", "filePath", "folderId"],
          properties: {
            id: {
              type: "string",
              description: "File ID",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            fileName: {
              type: "string",
              description: "Original file name",
              example: "contract.pdf",
              maxLength: 255,
            },
            description: {
              type: "string",
              description: "File description",
              example: "Client signed contract document",
              maxLength: 1000,
              nullable: true,
            },
            filePath: {
              type: "string",
              description: "Path to the stored file",
              example: "/uploads/contracts/contract-123.pdf",
            },
            fileSize: {
              type: "integer",
              description: "File size in bytes",
              example: 1048576,
              nullable: true,
            },
            metaTags: {
              type: "object",
              description: "JSON object of meta tags associated with the file",
              example: {
                tags: ["important", "client", "2024"],
                category: "legal",
                priority: "high",
              },
              nullable: true,
            },
            mimeType: {
              type: "string",
              description: "File MIME type",
              example: "application/pdf",
              nullable: true,
            },
            folderId: {
              type: "string",
              description: "ID of the folder containing this file",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            uploadedAt: {
              type: "string",
              format: "date-time",
              description: "File upload timestamp",
              example: "2024-01-15T10:30:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "File last update timestamp",
              example: "2024-01-15T10:30:00Z",
            },
            folder: {
              type: "object",
              description: "Folder information",
              properties: {
                id: {
                  type: "string",
                  example: "123e4567-e89b-12d3-a456-426614174000",
                },
                name: {
                  type: "string",
                  example: "Contracts",
                },
                client: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      example: "123e4567-e89b-12d3-a456-426614174000",
                    },
                    fullName: {
                      type: "string",
                      example: "John Doe",
                    },
                    caseNumber: {
                      type: "string",
                      example: "CASE-2024-001",
                    },
                  },
                },
              },
            },
          },
        },

        // Note Schemas
        Note: {
          type: "object",
          required: ["title", "content", "clientId"],
          properties: {
            id: {
              type: "string",
              description: "Note ID",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            title: {
              type: "string",
              description: "Note title",
              example: "Client Meeting Summary",
              maxLength: 200,
            },
            content: {
              type: "string",
              description: "Note content",
              example: "Discussed case strategy and next steps.",
              maxLength: 5000,
            },
            clientId: {
              type: "string",
              description: "ID of the client this note belongs to",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Note creation timestamp",
              example: "2024-01-15T10:30:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Note last update timestamp",
              example: "2024-01-15T10:30:00Z",
            },
            client: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  example: "123e4567-e89b-12d3-a456-426614174000",
                },
                fullName: {
                  type: "string",
                  example: "John Doe",
                },
                caseNumber: {
                  type: "string",
                  example: "CASE-2024-001",
                },
              },
            },
            files: {
              type: "array",
              items: {
                $ref: "#/components/schemas/NoteFile",
              },
              description: "Files attached to the note",
            },
          },
        },

        NoteFile: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            fileName: {
              type: "string",
              example: "meeting_notes.pdf",
            },
            filePath: {
              type: "string",
              example: "/uploads/notes/meeting_notes.pdf",
            },
            mimeType: {
              type: "string",
              example: "application/pdf",
              nullable: true,
            },
            fileSize: {
              type: "integer",
              example: 1048576,
              nullable: true,
            },
            uploadedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
            },
          },
        },

        // Common Schemas
        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              example: 1,
            },
            limit: {
              type: "integer",
              example: 10,
            },
            total: {
              type: "integer",
              example: 100,
            },
            totalPages: {
              type: "integer",
              example: 10,
            },
          },
        },

        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message describing what went wrong",
            },
            error: {
              type: "string",
              example: "Detailed error description or stack trace",
              nullable: true,
            },
            code: {
              type: "string",
              example: "VALIDATION_ERROR",
              nullable: true,
            },
          },
        },

        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },

        PaginatedResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Data retrieved successfully",
            },
            data: {
              type: "array",
              description: "Array of items",
            },
            pagination: {
              $ref: "#/components/schemas/Pagination",
            },
          },
        },

        ClientStatistics: {
          type: "object",
          properties: {
            totalClients: {
              type: "integer",
              example: 150,
            },
            byStatus: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "Active",
                  },
                  _count: {
                    type: "object",
                    properties: {
                      status: {
                        type: "integer",
                        example: 100,
                      },
                    },
                  },
                },
              },
            },
            byLawyer: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  assignedLawyerId: {
                    type: "string",
                    example: "clabc123def456ghi789jkl012",
                  },
                  _count: {
                    type: "object",
                    properties: {
                      assignedLawyerId: {
                        type: "integer",
                        example: 25,
                      },
                    },
                  },
                  assignedLawyer: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "clabc123def456ghi789jkl012",
                      },
                      name: {
                        type: "string",
                        example: "Sarah Johnson",
                      },
                    },
                    nullable: true,
                  },
                },
              },
            },
            recentClients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    example: "123e4567-e89b-12d3-a456-426614174000",
                  },
                  fullName: {
                    type: "string",
                    example: "John Doe",
                  },
                  caseNumber: {
                    type: "string",
                    example: "CASE-2024-001",
                  },
                  status: {
                    type: "string",
                    example: "Pending",
                  },
                  createdAt: {
                    type: "string",
                    format: "date-time",
                    example: "2024-01-15T10:30:00Z",
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Authentication required",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        Forbidden: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        ValidationError: {
          description: "Validation failed",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
      parameters: {
        PaginationPage: {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            default: 1,
          },
          description: "Page number for pagination",
        },
        PaginationLimit: {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
          },
          description: "Number of items per page",
        },
        SortBy: {
          in: "query",
          name: "sortBy",
          schema: {
            type: "string",
            default: "createdAt",
          },
          description: "Field to sort by",
        },
        SortOrder: {
          in: "query",
          name: "sortOrder",
          schema: {
            type: "string",
            enum: ["asc", "desc"],
            default: "desc",
          },
          description: "Sort order",
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints (RBAC controlled)",
      },
      {
        name: "Clients",
        description:
          "Client management endpoints with role-based access control",
      },
      {
        name: "Notes",
        description: "Notes management endpoints",
      },
      {
        name: "Files",
        description: "File management endpoints with role-based permissions",
      },
      {
        name: "Folders",
        description: "Folder management endpoints",
      },
      {
        name: "Arbitration",
        description: "Arbitration case management endpoints",
      },
      {
        name: "Admin",
        description: "Administrative endpoints for system management",
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
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
};
