import prisma from "../config/db";
import { CreateNoteData, UpdateNoteData } from "../types/note.types";
import { PaginationParams, PaginatedResponse } from "../utils/response";
import path from "path";
import fs from "fs";

export const noteService = {
  // Create a new note
  async createNote(data: CreateNoteData) {
    // ✅ 1. Check client
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });
    if (!client) throw new Error("Client not found");

    // ✅ 2. Create the note
    const note = await prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        clientId: data.clientId,
      },
    });

    // ✅ 3. If files were uploaded, save them
    if (data.files && data.files.length > 0) {
      const uploadDir = path.join(__dirname, "../../uploads/notes");
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      const fileRecords = await Promise.all(
        data.files.map(async (file) => {
          const filePath = path.join(uploadDir, file.originalname);
          fs.writeFileSync(filePath, file.buffer);

          return prisma.noteFile.create({
            data: {
              fileName: file.originalname,
              filePath: `/uploads/notes/${file.originalname}`,
              mimeType: file.mimetype,
              fileSize: file.size,
              noteId: note.id,
            },
          });
        })
      );
    }

    // ✅ 4. Return note with client + files
    return prisma.note.findUnique({
      where: { id: note.id },
      include: {
        client: { select: { id: true, fullName: true, caseNumber: true } },
        files: true,
      },
    });
  },

  // Get all notes for a client with pagination
  async getNotesByClientId(
    clientId: string,
    paginationParams?: PaginationParams
  ) {
    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    const page = paginationParams?.page || 1;
    const limit = Number(paginationParams?.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = paginationParams?.sortBy || "createdAt";
    const sortOrder = paginationParams?.sortOrder || "desc";

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where: { clientId },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              caseNumber: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.note.count({
        where: { clientId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: notes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  // Get note by ID
  async getNoteById(id: string) {
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            caseNumber: true,
          },
        },
      },
    });

    if (!note) {
      throw new Error("Note not found");
    }

    return note;
  },

  // Update note
  async updateNote(id: string, data: UpdateNoteData) {
    // Check if note exists
    const existingNote = await prisma.note.findUnique({
      where: { id },
    });

    if (!existingNote) {
      throw new Error("Note not found");
    }

    return await prisma.note.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            caseNumber: true,
          },
        },
      },
    });
  },

  // Delete note
  async deleteNote(id: string): Promise<void> {
    // Check if note exists
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      throw new Error("Note not found");
    }

    await prisma.note.delete({
      where: { id },
    });
  },

  // Add these methods to your existing noteService

  // Get all notes with pagination (across all clients)
  async getAllNotes(paginationParams?: PaginationParams) {
    const page = paginationParams?.page || 1;
    const limit = Number(paginationParams?.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = paginationParams?.sortBy || "createdAt";
    const sortOrder = paginationParams?.sortOrder || "desc";

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              caseNumber: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.note.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: notes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  // Search across all notes with pagination
  async searchAllNotes(
    searchTerm: string,
    paginationParams?: PaginationParams
  ) {
    const page = paginationParams?.page || 1;
    const limit = Number(paginationParams?.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = paginationParams?.sortBy || "createdAt";
    const sortOrder = paginationParams?.sortOrder || "desc";

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm } },
            { content: { contains: searchTerm } },
          ],
        },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              caseNumber: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.note.count({
        where: {
          OR: [
            { title: { contains: searchTerm } },
            { content: { contains: searchTerm } },
          ],
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: notes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  // Search notes by content or title with pagination
  async searchNotes(
    clientId: string,
    searchTerm: string,
    paginationParams?: PaginationParams
  ) {
    const page = paginationParams?.page || 1;
    const limit = Number(paginationParams?.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = paginationParams?.sortBy || "createdAt";
    const sortOrder = paginationParams?.sortOrder || "desc";

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where: {
          clientId,
          OR: [
            { title: { contains: searchTerm } },
            { content: { contains: searchTerm } },
          ],
        },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              caseNumber: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.note.count({
        where: {
          clientId,
          OR: [
            { title: { contains: searchTerm } },
            { content: { contains: searchTerm } },
          ],
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: notes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },
};
