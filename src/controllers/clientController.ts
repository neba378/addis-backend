import { Request, Response } from "express";
import { clientService } from "../services/clientService";
import {
  paginatedResponse,
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../utils/response";
import {
  CreateClientInput,
  UpdateClientInput,
  ClientSearchInput,
  ClientIdParams,
} from "../validations/client.validation";

export const clientController = {
  // Create a new client
  async createClient(req: Request, res: Response) {
    try {
      const {
        fullName,
        phoneNumber,
        appointmentDate,
        assignedLawyer,
        court,
        createdBy,
        status,
        caseNumber,
        notes,
      } = req.body as CreateClientInput;

      const client = await clientService.createClient({
        fullName,
        phoneNumber,
        appointmentDate,
        assignedLawyer,
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

  // Get all clients with optional filtering
  async getClients(req: Request, res: Response) {
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

      const result = await clientService.getClients(
        { page: numericPage, limit: numericLimit, sortBy, sortOrder },
        filters
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

  // Get client by ID
  async getClientById(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as ClientIdParams;

      const client = await clientService.getClientById(Number(id));
      successResponse(res, client, "Client retrieved successfully");
    } catch (error: any) {
      if (error.message === "Client not found") {
        return notFoundResponse(res, "Client");
      }
      errorResponse(res, "Failed to retrieve client", 500, error.message);
    }
  },

  // Update client
  async updateClient(req: Request, res: Response) {
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

      const client = await clientService.updateClient(Number(id), {
        fullName,
        caseNumber,
        phoneNumber,
        appointmentDate,
        assignedLawyer,
        court,
        status,
      });

      successResponse(res, client, "Client updated successfully");
    } catch (error: any) {
      if (error.message === "Client not found") {
        return notFoundResponse(res, "Client");
      }
      if (error.message === "Case number already exists") {
        return errorResponse(res, error.message, 400);
      }
      errorResponse(res, "Failed to update client", 500, error.message);
    }
  },

  // Delete client
  async deleteClient(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as ClientIdParams;

      await clientService.deleteClient(Number(id));
      successResponse(res, null, "Client deleted successfully");
    } catch (error: any) {
      if (error.message === "Client not found") {
        return notFoundResponse(res, "Client");
      }
      errorResponse(res, "Failed to delete client", 500, error.message);
    }
  },

  // Search clients
  async searchClients(req: Request, res: Response) {
    try {
      const { q, status, lawyer, startDate, page, limit, sortBy, sortOrder } =
        req.query as unknown as ClientSearchInput;

      const filters = {
        search: q,
        status,
        lawyer,
        startDate: startDate ? new Date(startDate) : undefined,
      };

      const result = await clientService.searchClients(filters, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

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

  // Get client statistics
  async getClientStatistics(req: Request, res: Response) {
    try {
      const statistics = await clientService.getClientStatistics();
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
