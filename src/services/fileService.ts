import prisma from "../config/db";
import {
  CreateFileData,
  UpdateFileData,
  FileWithFolder,
} from "../types/file.types";
import { PaginationParams, PaginatedResponse } from "../utils/response";

export const fileService = {
  async createFile(data: CreateFileData): Promise<FileWithFolder> {
    // Verify folder exists and get folderId from it
    const folder = await prisma.folder.findUnique({
      where: { id: data.folderId },
      include: {
        client: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!folder) throw new Error("Folder not found");

    return prisma.file.create({
      data: {
        fileName: data.fileName,
        description: data.description ?? null,
        filePath: data.filePath,
        fileSize: data.fileSize ?? null,
        mimeType: data.mimeType ?? null,
        folderId: data.folderId,
        metaTags: data.metaTags ?? [],
      },
      include: {
        folder: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                caseNumber: true,
              },
            },
          },
        },
      },
    });
  },

  async getFilesByFolderId(
    folderId: string,
    paginationParams?: PaginationParams
  ): Promise<PaginatedResponse<FileWithFolder>> {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
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

    if (!folder) throw new Error("Folder not found");

    const page = paginationParams?.page ?? 1;
    const limit = paginationParams?.limit ?? 10;
    const skip = (page - 1) * limit;

    const sortBy = paginationParams?.sortBy ?? "uploadedAt";
    const sortOrder = paginationParams?.sortOrder ?? "desc";

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: { folderId },
        include: {
          folder: {
            include: {
              client: {
                select: {
                  id: true,
                  fullName: true,
                  caseNumber: true,
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.file.count({ where: { folderId } }),
    ]);

    return {
      data: files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getFilesByfolderId(
    folderId: string,
    paginationParams?: PaginationParams
  ): Promise<PaginatedResponse<FileWithFolder>> {
    const client = await prisma.client.findUnique({
      where: { id: folderId },
    });

    if (!client) throw new Error("Client not found");

    const page = paginationParams?.page ?? 1;
    const limit = paginationParams?.limit ?? 10;
    const skip = (page - 1) * limit;

    const sortBy = paginationParams?.sortBy ?? "uploadedAt";
    const sortOrder = paginationParams?.sortOrder ?? "desc";

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: { folderId },
        include: {
          folder: {
            include: {
              client: {
                select: {
                  id: true,
                  fullName: true,
                  caseNumber: true,
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.file.count({ where: { folderId } }),
    ]);

    return {
      data: files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getFileById(id: string): Promise<FileWithFolder> {
    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        folder: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                caseNumber: true,
              },
            },
          },
        },
      },
    });

    if (!file) throw new Error("File not found");
    return file;
  },

  async updateFile(id: string, data: UpdateFileData): Promise<FileWithFolder> {
    const existingFile = await prisma.file.findUnique({ where: { id } });
    if (!existingFile) throw new Error("File not found");

    return prisma.file.update({
      where: { id },
      data: {
        fileName: data.fileName ?? existingFile.fileName,
        description: data.description ?? existingFile.description,
        metaTags: data.metaTags ?? [],
      },
      include: {
        folder: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                caseNumber: true,
              },
            },
          },
        },
      },
    });
  },

  async deleteFile(id: string): Promise<void> {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) throw new Error("File not found");

    await prisma.file.delete({ where: { id } });
  },

  async searchFiles(
    folderId: string,
    searchTerm: string,
    paginationParams?: PaginationParams
  ): Promise<PaginatedResponse<FileWithFolder>> {
    const client = await prisma.client.findUnique({
      where: { id: folderId },
    });

    if (!client) throw new Error("Client not found");

    const page = paginationParams?.page ?? 1;
    const limit = paginationParams?.limit ?? 10;
    const skip = (page - 1) * limit;

    const sortBy = paginationParams?.sortBy ?? "uploadedAt";
    const sortOrder = paginationParams?.sortOrder ?? "desc";

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: {
          folderId,
          OR: [
            { fileName: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { metaTags: { array_contains: [searchTerm] } },
          ],
        },
        include: {
          folder: {
            include: {
              client: {
                select: {
                  id: true,
                  fullName: true,
                  caseNumber: true,
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.file.count({
        where: {
          folderId,
          OR: [
            { fileName: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { metaTags: { array_contains: [searchTerm] } },
          ],
        },
      }),
    ]);

    return {
      data: files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getFileStatistics(folderId: string) {
    const client = await prisma.client.findUnique({
      where: { id: folderId },
    });

    if (!client) throw new Error("Client not found");

    const totalFiles = await prisma.file.count({ where: { folderId } });

    const filesByType = await prisma.file.groupBy({
      by: ["mimeType"],
      _count: { mimeType: true },
      where: { folderId },
    });

    const totalSize = await prisma.file.aggregate({
      where: { folderId },
      _sum: { fileSize: true },
    });

    return {
      totalFiles,
      byType: filesByType,
      totalSize: totalSize._sum.fileSize ?? 0,
    };
  },

  async getFolderFileStatistics(folderId: string) {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) throw new Error("Folder not found");

    const totalFiles = await prisma.file.count({ where: { folderId } });

    const filesByType = await prisma.file.groupBy({
      by: ["mimeType"],
      _count: { mimeType: true },
      where: { folderId },
    });

    const totalSize = await prisma.file.aggregate({
      where: { folderId },
      _sum: { fileSize: true },
    });

    return {
      totalFiles,
      byType: filesByType,
      totalSize: totalSize._sum.fileSize ?? 0,
    };
  },
};
