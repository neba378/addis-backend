import { Request, Response } from "express";
import { folderService } from "../services/folderService";
import {
  paginatedResponse,
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../utils/response";
import {
  CreateFolderInput,
  UpdateFolderInput,
  FolderSearchInput,
  FolderIdParams,
  ClientIdParams,
} from "../validations/folder.validation";
import { PaginationInput } from "../validations/note.validation";

export const folderController = {
  // Create a new folder
  async createFolder(req: Request, res: Response) {
    try {
      const { name, clientId, type, description } =
        req.body as CreateFolderInput;

      const folder = await folderService.createFolder({
        name,
        clientId,
        type,
        description,
      });
      successResponse(res, folder, "Folder created successfully", 201);
    } catch (error: any) {
      if (error.message === "Client not found") {
        return notFoundResponse(res, "Client");
      }
      if (
        error.message === "Folder with this name already exists for this client"
      ) {
        return errorResponse(res, error.message, 400);
      }
      errorResponse(res, "Failed to create folder", 500, error.message);
    }
  },

  // Get all folders for a client
  async getFoldersByClientId(req: Request, res: Response) {
    try {
      const { clientId } = req.params as unknown as ClientIdParams;
      const { page, limit, sortBy, sortOrder } =
        req.query as unknown as PaginationInput;

      const numericClientId = clientId;
      const numericPage = page ? Number(page) : 1;
      const numericLimit = limit ? Number(limit) : 10;

      const result = await folderService.getFoldersByClientId(numericClientId, {
        page: numericPage,
        limit: numericLimit,
        sortBy,
        sortOrder,
      });

      paginatedResponse(
        res,
        result.data,
        result.pagination,
        "Folders retrieved successfully"
      );
    } catch (error: any) {
      if (error.message === "Client not found") {
        return notFoundResponse(res, "Client");
      }
      errorResponse(res, "Failed to retrieve folders", 500, error.message);
    }
  },

  // Get folder by ID
  async getFolderById(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as FolderIdParams;
      const numericId = id;
      const folder = await folderService.getFolderById(numericId);
      successResponse(res, folder, "Folder retrieved successfully");
    } catch (error: any) {
      if (error.message === "Folder not found") {
        return notFoundResponse(res, "Folder");
      }
      errorResponse(res, "Failed to retrieve folder", 500, error.message);
    }
  },

  // Update folder
  async updateFolder(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as FolderIdParams;
      const { name, description } = req.body as UpdateFolderInput;

      const folder = await folderService.updateFolder(id, {
        name,
        description,
      });
      successResponse(res, folder, "Folder updated successfully");
    } catch (error: any) {
      if (error.message === "Folder not found") {
        return notFoundResponse(res, "Folder");
      }
      if (
        error.message === "Cannot rename default folders" ||
        error.message === "Folder with this name already exists for this client"
      ) {
        return errorResponse(res, error.message, 400);
      }
      errorResponse(res, "Failed to update folder", 500, error.message);
    }
  },

  // Delete folder
  async deleteFolder(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as FolderIdParams;

      await folderService.deleteFolder(id);
      successResponse(res, null, "Folder deleted successfully");
    } catch (error: any) {
      if (error.message === "Folder not found") {
        return notFoundResponse(res, "Folder");
      }
      if (
        error.message === "Cannot delete default folders" ||
        error.message === "Cannot delete folder that contains files"
      ) {
        return errorResponse(res, error.message, 400);
      }
      errorResponse(res, "Failed to delete folder", 500, error.message);
    }
  },

  // Search folders
  async searchFolders(req: Request, res: Response) {
    try {
      const { clientId } = req.params as unknown as ClientIdParams;
      const { q, page, limit, sortBy, sortOrder } =
        req.query as unknown as FolderSearchInput;

      const numericPage = page ? Number(page) : 1;
      const numericLimit = limit ? Number(limit) : 10;

      const result = await folderService.searchFolders(clientId, q, {
        page: numericPage,
        limit: numericLimit,
        sortBy,
        sortOrder,
      });

      paginatedResponse(
        res,
        result.data,
        result.pagination,
        "Folders search completed"
      );
    } catch (error: any) {
      errorResponse(res, "Failed to search folders", 500, error.message);
    }
  },

  // Get folder statistics
  async getFolderStatistics(req: Request, res: Response) {
    try {
      const { clientId } = req.params as unknown as ClientIdParams;

      const statistics = await folderService.getFolderStatistics(clientId);
      successResponse(
        res,
        statistics,
        "Folder statistics retrieved successfully"
      );
    } catch (error: any) {
      errorResponse(res, "Failed to get folder statistics", 500, error.message);
    }
  },
};
