import { Request, Response } from "express";
import { fileService } from "../services/fileService";
import {
  paginatedResponse,
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../utils/response";
import {
  CreateFileInput,
  UpdateFileInput,
  FileSearchInput,
  FileIdParams,
  FolderIdParams,
  ClientIdParams,
} from "../validations/file.validation";
import { PaginationInput } from "../validations/note.validation";
import { UpdateFileData } from "../types/file.types";
import * as fsp from "fs/promises"; // Import fs/promises as fsp
import fs from "fs"; // Keep standard fs for createReadStream
import path from "path";
const UPLOAD_DIR = path.join(__dirname, "../../uploads");
export const fileController = {
  // Create a new file record with uploaded file
  async createFile(req: Request, res: Response) {
    try {
      const { fileName, description, folderId, metaTags } = req.body;

      if (!req.file) {
        return errorResponse(res, "No file uploaded", 400);
      }

      // Ensure upload directory exists
      await fsp.mkdir(UPLOAD_DIR, { recursive: true });

      // Generate unique file name
      const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
      const destinationPath = path.join(UPLOAD_DIR, uniqueFileName);

      // Save file from memory buffer to disk
      await fsp.writeFile(destinationPath, req.file.buffer);

      // Validate folderId
      const parsedFolderId = folderId;
      if (isNaN(parsedFolderId)) {
        await fsp.unlink(destinationPath).catch(() => {});
        return errorResponse(res, "Folder ID must be a valid number", 400);
      }

      // Prepare file data for DB
      const fileData = {
        fileName: fileName || req.file.originalname,
        description: description || undefined,
        filePath: destinationPath,
        metaTags: metaTags ? JSON.parse(metaTags) : [],
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        folderId: parsedFolderId,
      };

      // Store in DB
      const file = await fileService.createFile(fileData);
      successResponse(res, file, "File uploaded successfully", 201);
    } catch (error: any) {
      console.error("Upload error:", error);
      errorResponse(res, "Failed to upload file", 500, error.message);
    }
  },

  // Serve file for download/viewing
  async serveFile(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as FileIdParams;
      const file = await fileService.getFileById(id);

      if (!file) {
        return notFoundResponse(res, "File");
      }

      // Check if file exists on disk
      try {
        await fsp.access(file.filePath); // Use fsp.access
      } catch {
        return notFoundResponse(res, "File not found on server");
      }

      // Set appropriate headers
      res.setHeader(
        "Content-Type",
        file.mimeType || "application/octet-stream"
      );
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${file.fileName}"`
      );
      res.setHeader("Content-Length", file.fileSize?.toString() || "0");

      // Stream the file (use standard fs for createReadStream)
      const fileStream = fs.createReadStream(file.filePath);
      fileStream.pipe(res);

      fileStream.on("error", (error) => {
        console.error("File stream error:", error);
        errorResponse(res, "Error streaming file", 500);
      });
    } catch (error: any) {
      if (error.message === "File not found") {
        return notFoundResponse(res, "File");
      }
      errorResponse(res, "Failed to serve file", 500, error.message);
    }
  },

  // Download file
  async downloadFile(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as FileIdParams;
      const file = await fileService.getFileById(id);

      if (!file) {
        return notFoundResponse(res, "File");
      }

      // Check if file exists on disk
      try {
        await fsp.access(file.filePath); // Use fsp.access
      } catch {
        return notFoundResponse(res, "File not found on server");
      }

      // Set download headers
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.fileName}"`
      );
      res.setHeader("Content-Length", file.fileSize?.toString() || "0");

      // Stream the file for download (use standard fs for createReadStream)
      const fileStream = fs.createReadStream(file.filePath);
      fileStream.pipe(res);

      fileStream.on("error", (error) => {
        console.error("File stream error:", error);
        errorResponse(res, "Error downloading file", 500);
      });
    } catch (error: any) {
      if (error.message === "File not found") {
        return notFoundResponse(res, "File");
      }
      errorResponse(res, "Failed to download file", 500, error.message);
    }
  },

  // Get all files for a folder
  async getFilesByFolderId(req: Request, res: Response) {
    try {
      const { folderId } = req.params as unknown as FolderIdParams;
      const { page, limit, sortBy, sortOrder } =
        req.query as unknown as PaginationInput;

      const result = await fileService.getFilesByFolderId(folderId, {
        page: Number(page || 1),
        limit: Number(limit || 10),
        sortBy,
        sortOrder,
      });

      paginatedResponse(
        res,
        result.data,
        result.pagination,
        "Files retrieved successfully"
      );
    } catch (error: any) {
      if (error.message === "Folder not found") {
        return notFoundResponse(res, "Folder");
      }
      errorResponse(res, "Failed to retrieve files", 500, error.message);
    }
  },

  // Get file by ID (metadata only)
  async getFileById(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as FileIdParams;
      const file = await fileService.getFileById(id);
      successResponse(res, file, "File retrieved successfully");
    } catch (error: any) {
      if (error.message === "File not found") {
        return notFoundResponse(res, "File");
      }
      errorResponse(res, "Failed to retrieve file", 500, error.message);
    }
  },

  // Update file metadata
  async updateFile(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as FileIdParams;
      const { fileName, description, metaTags } = req.body as UpdateFileInput;

      const updateData: UpdateFileData = {};
      if (fileName !== undefined) updateData.fileName = fileName;
      if (description !== undefined) updateData.description = description;
      if (metaTags !== undefined) {
        if (typeof metaTags === "string") {
          updateData.metaTags = JSON.parse(metaTags);
        } else {
          updateData.metaTags = metaTags;
        }
      }

      const file = await fileService.updateFile(id, updateData);
      successResponse(res, file, "File updated successfully");
    } catch (error: any) {
      if (error.message === "File not found") {
        return notFoundResponse(res, "File");
      }
      errorResponse(res, "Failed to update file", 500, error.message);
    }
  },

  // Delete file (both database record and physical file)
  async deleteFile(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as FileIdParams;
      const fileId = id;

      // Get file info first to delete the physical file
      const file = await fileService.getFileById(fileId);

      // Delete from database
      await fileService.deleteFile(fileId);

      // Delete physical file
      try {
        await fsp.unlink(file.filePath); // Use fsp.unlink
      } catch (error) {
        console.warn("Could not delete physical file:", error);
        // Continue even if physical file deletion fails
      }

      successResponse(res, null, "File deleted successfully");
    } catch (error: any) {
      if (error.message === "File not found") {
        return notFoundResponse(res, "File");
      }
      errorResponse(res, "Failed to delete file", 500, error.message);
    }
  },

  // Search files
  async searchFiles(req: Request, res: Response) {
    try {
      const { clientId } = req.params as unknown as ClientIdParams;
      const { q, page, limit, sortBy, sortOrder } =
        req.query as unknown as FileSearchInput;

      const result = await fileService.searchFiles(clientId, q, {
        page: Number(page || 1),
        limit: Number(limit || 10),
        sortBy,
        sortOrder,
      });

      paginatedResponse(
        res,
        result.data,
        result.pagination,
        "Files search completed"
      );
    } catch (error: any) {
      errorResponse(res, "Failed to search files", 500, error.message);
    }
  },

  // Get file statistics
  async getFileStatistics(req: Request, res: Response) {
    try {
      const { clientId } = req.params as unknown as ClientIdParams;
      const statistics = await fileService.getFileStatistics(clientId);
      successResponse(
        res,
        statistics,
        "File statistics retrieved successfully"
      );
    } catch (error: any) {
      errorResponse(res, "Failed to get file statistics", 500, error.message);
    }
  },
};
