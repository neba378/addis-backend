import { Request, Response } from "express";
import { clientService } from "../services/clientService";
import {
  paginatedResponse,
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
} from "../utils/response";
import {
  CreateClientInput,
  UpdateClientInput,
  ClientSearchInput,
  ClientIdParams,
} from "../validations/client.validation";
import { AuthRequest } from "../middlewares/auth.middleware";

export const clientController = {
  // Create a new client
  async createClient(req: AuthRequest, res: Response) {
    try {
      const {
        fullName,
        phoneNumber,
        appointmentDate,
        assignedLawyerId,
        court,
        status,
        caseNumber,
        notes,
      } = req.body as CreateClientInput;

      const createdBy = req.user!.id; // Get from authenticated user

      const client = await clientService.createClient({
        fullName,
        phoneNumber,
        appointmentDate,
        assignedLawyerId,
        court,
        createdBy,
        status,
        caseNumber,
        notes,
      });

      successResponse(
        res,
        client,
        "Client created successfully with default folders",
        201
      );
    } catch (error: any) {
      if (error.message === "Case number already exists") {
        return errorResponse(res, error.message, 400);
      }
      errorResponse(res, "Failed to create client", 500, error.message);
    }
  },

  // Get all clients with optional filtering - WITH RBAC
  async getClients(req: AuthRequest, res: Response) {
    try {
      const { page, limit, sortBy, sortOrder, status, lawyer, startDate } =
        req.query as unknown as ClientSearchInput;
      const numericPage = page ? Number(page) : 1;
      const numericLimit = limit ? Number(limit) : 10;

      const filters = {
        status,
        lawyer,
        startDate: startDate ? new Date(startDate) : undefined,
      };

      // Get user info from auth middleware for RBAC
      const userRole = req.user!.role;
      const userId = req.user!.id;

      const result = await clientService.getClients(
        { page: numericPage, limit: numericLimit, sortBy, sortOrder },
        filters,
        userRole,
        userId
      );

      paginatedResponse(
        res,
        result.data,
        result.pagination,
        "Clients retrieved successfully"
      );
    } catch (error: any) {
      errorResponse(res, "Failed to retrieve clients", 500, error.message);
    }
  },

  // Get client by ID - WITH RBAC
  async getClientById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as unknown as ClientIdParams;

      // Get user info from auth middleware for RBAC
      const userRole = req.user!.role;
      const userId = req.user!.id;

      const client = await clientService.getClientById(id, userRole, userId);
      successResponse(res, client, "Client retrieved successfully");
    } catch (error: any) {
      if (error.message === "Client not found") {
        return notFoundResponse(res, "Client");
      }
      if (error.message === "Access denied") {
        return forbiddenResponse(res, "Access denied to this client");
      }
      errorResponse(res, "Failed to retrieve client", 500, error.message);
    }
  },

  // Update client - WITH RBAC
  async updateClient(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as unknown as ClientIdParams;
      const {
        fullName,
        caseNumber,
        phoneNumber,
        appointmentDate,
        assignedLawyer,
        court,
        status,
      } = req.body as UpdateClientInput;

      // Get user info from auth middleware for RBAC
      const userRole = req.user!.role;
      const userId = req.user!.id;

      const client = await clientService.updateClient(
        id,
        {
          fullName,
          caseNumber,
          phoneNumber,
          appointmentDate,
          assignedLawyerId:
            assignedLawyer === null ? undefined : assignedLawyer,
          court,
          status,
        },
        userRole,
        userId
      );

      successResponse(res, client, "Client updated successfully");
    } catch (error: any) {
      if (error.message === "Client not found") {
        return notFoundResponse(res, "Client");
      }
      if (error.message === "Case number already exists") {
        return errorResponse(res, error.message, 400);
      }
      if (
        error.message === "Access denied" ||
        error.message === "Cannot change assigned lawyer"
      ) {
        return forbiddenResponse(res, error.message);
      }
      errorResponse(res, "Failed to update client", 500, error.message);
    }
  },

  // Delete client - WITH RBAC
  async deleteClient(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as unknown as ClientIdParams;

      // Get user role from auth middleware for RBAC
      const userRole = req.user!.role;

      await clientService.deleteClient(id, userRole);
      successResponse(res, null, "Client deleted successfully");
    } catch (error: any) {
      if (error.message === "Client not found") {
        return notFoundResponse(res, "Client");
      }
      if (error.message === "Access denied") {
        return forbiddenResponse(res, "Access denied");
      }
      errorResponse(res, "Failed to delete client", 500, error.message);
    }
  },

  // Search clients - WITH RBAC
  async searchClients(req: AuthRequest, res: Response) {
    try {
      const { q, status, lawyer, startDate, page, limit, sortBy, sortOrder } =
        req.query as unknown as ClientSearchInput;

      const filters = {
        search: q,
        status,
        lawyer,
        startDate: startDate ? new Date(startDate) : undefined,
      };

      // Get user info from auth middleware for RBAC
      const userRole = req.user!.role;
      const userId = req.user!.id;

      const result = await clientService.searchClients(
        filters,
        {
          page,
          limit,
          sortBy,
          sortOrder,
        },
        userRole,
        userId
      );

      paginatedResponse(
        res,
        result.data,
        result.pagination,
        "Clients search completed"
      );
    } catch (error: any) {
      errorResponse(res, "Failed to search clients", 500, error.message);
    }
  },

  // Get client statistics - WITH RBAC
  async getClientStatistics(req: AuthRequest, res: Response) {
    try {
      // Get user info from auth middleware for RBAC
      const userRole = req.user!.role;
      const userId = req.user!.id;

      const statistics = await clientService.getClientStatistics(
        userRole,
        userId
      );
      successResponse(
        res,
        statistics,
        "Client statistics retrieved successfully"
      );
    } catch (error: any) {
      errorResponse(res, "Failed to get client statistics", 500, error.message);
    }
  },

  // Check if case number exists
  async checkCaseNumberExists(req: Request, res: Response) {
    try {
      const { caseNumber } = req.query;

      if (!caseNumber || typeof caseNumber !== "string") {
        return errorResponse(res, "Case number is required", 400);
      }

      const exists = await clientService.checkCaseNumberExists(caseNumber);
      successResponse(res, { exists }, "Case number check completed");
    } catch (error: any) {
      errorResponse(res, "Failed to check case number", 500, error.message);
    }
  },
};
