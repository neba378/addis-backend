import { Request, Response } from "express";
import { noteService } from "../services/noteService";
import {
  paginatedResponse,
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../utils/response";
import {
  CreateNoteInput,
  UpdateNoteInput,
  NoteSearchInput,
  PaginationInput,
  NoteIdParams,
  ClientIdParams,
} from "../validations/note.validation";

export const noteController = {
  // Create a new note
  async createNote(req: Request, res: Response) {
    try {
      const { title, content, clientId } = req.body as CreateNoteInput;
      const files = req.files as Express.Multer.File[]; // 👈 from multer

      const note = await noteService.createNote({
        title,
        content,
        clientId: clientId,
        files, // 👈 pass to service
      });

      successResponse(res, note, "Note created successfully", 201);
    } catch (error: any) {
      if (error.message === "Client not found") {
        return notFoundResponse(res, "Client");
      }
      errorResponse(res, "Failed to create note", 500, error.message);
    }
  },

  // Add these methods to your existing noteController

  // Get all notes with pagination
  async getAllNotes(req: Request, res: Response) {
    try {
      const { page, limit, sortBy, sortOrder } =
        req.query as unknown as PaginationInput;
      const numericPage = page ? Number(page) : 1;
      const numericLimit = limit ? Number(limit) : 10;

      const result = await noteService.getAllNotes({
        page: numericPage,
        limit: numericLimit,
        sortBy,
        sortOrder,
      });

      paginatedResponse(
        res,
        result.data,
        result.pagination,
        "All notes retrieved successfully"
      );
    } catch (error: any) {
      errorResponse(res, "Failed to retrieve notes", 500, error.message);
    }
  },

  // Search across all notes
  async searchAllNotes(req: Request, res: Response) {
    try {
      const { q, page, limit, sortBy, sortOrder } =
        req.query as unknown as NoteSearchInput;
      const numericPage = page ? Number(page) : 1;
      const numericLimit = limit ? Number(limit) : 10;

      const result = await noteService.searchAllNotes(q, {
        page: numericPage,
        limit: numericLimit,
        sortBy,
        sortOrder,
      });

      paginatedResponse(
        res,
        result.data,
        result.pagination,
        "Global notes search completed"
      );
    } catch (error: any) {
      errorResponse(res, "Failed to search notes", 500, error.message);
    }
  },

  // Get all notes for a client with pagination
  async getNotesByClientId(req: Request, res: Response) {
    try {
      const { clientId } = req.params as unknown as ClientIdParams;
      const { page, limit, sortBy, sortOrder } =
        req.query as unknown as PaginationInput;
      const numericPage = page ? Number(page) : 1;
      const numericLimit = limit ? Number(limit) : 10;

      const result = await noteService.getNotesByClientId(clientId, {
        page: numericPage,
        limit: numericLimit,
        sortBy,
        sortOrder,
      });

      paginatedResponse(
        res,
        result.data,
        result.pagination,
        "Notes retrieved successfully"
      );
    } catch (error: any) {
      if (error.message === "Client not found") {
        return notFoundResponse(res, "Client");
      }
      errorResponse(res, "Failed to retrieve notes", 500, error.message);
    }
  },

  // Get note by ID
  async getNoteById(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as NoteIdParams;

      const note = await noteService.getNoteById(id);
      successResponse(res, note, "Note retrieved successfully");
    } catch (error: any) {
      if (error.message === "Note not found") {
        return notFoundResponse(res, "Note");
      }
      errorResponse(res, "Failed to retrieve note", 500, error.message);
    }
  },

  // Update note
  async updateNote(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as NoteIdParams;
      const { title, content } = req.body as UpdateNoteInput;

      const updateData: Record<string, string> = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;

      const note = await noteService.updateNote(id, updateData);
      successResponse(res, note, "Note updated successfully");
    } catch (error: any) {
      if (error.message === "Note not found") {
        return notFoundResponse(res, "Note");
      }
      errorResponse(res, "Failed to update note", 500, error.message);
    }
  },

  // Delete note
  async deleteNote(req: Request, res: Response) {
    try {
      const { id } = req.params as unknown as NoteIdParams;

      await noteService.deleteNote(id);
      successResponse(res, null, "Note deleted successfully");
    } catch (error: any) {
      if (error.message === "Note not found") {
        return notFoundResponse(res, "Note");
      }
      errorResponse(res, "Failed to delete note", 500, error.message);
    }
  },

  // Search notes with pagination
  async searchNotes(req: Request, res: Response) {
    try {
      const { clientId } = req.params as unknown as ClientIdParams;
      const { q, page, limit, sortBy, sortOrder } =
        req.query as unknown as NoteSearchInput;
      const numericPage = page ? Number(page) : 1;
      const numericLimit = limit ? Number(limit) : 10;

      const result = await noteService.searchNotes(clientId, q, {
        page: numericPage,
        limit: numericLimit,
        sortBy,
        sortOrder,
      });

      paginatedResponse(
        res,
        result.data,
        result.pagination,
        "Notes search completed"
      );
    } catch (error: any) {
      errorResponse(res, "Failed to search notes", 500, error.message);
    }
  },
};
