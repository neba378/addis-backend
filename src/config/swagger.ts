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
        "Comprehensive API documentation for the Addis Digital Office Management System",
      contact: {
        name: "API Support",
        email: "support@addisdigital.com",
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
        url: "https://api.addisdigital.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token in the format: Bearer <token>",
        },
      },
      schemas: {
        Note: {
          type: "object",
          required: ["title", "content", "clientId"],
          properties: {
            id: {
              type: "integer",
              description: "Auto-generated note ID",
              example: 1,
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
              type: "integer",
              description: "ID of the client this note belongs to",
              example: 1,
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
          },
        },
        Client: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
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
              example: "Error message",
            },
            error: {
              type: "string",
              example: "Detailed error description",
            },
          },
        },
      },
      responses: {
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
    },
    tags: [
      {
        name: "Notes",
        description: "Notes management endpoints",
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
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Addis Digital API Documentation",
    })
  );
};
