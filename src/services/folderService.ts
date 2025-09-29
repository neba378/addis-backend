import prisma from "../config/db";
import {
  CreateFolderData,
  UpdateFolderData,
  FolderWithFiles,
  FolderWithClient,
} from "../types/folder.types";
import { PaginationParams } from "../utils/response";

export const folderService = {
  // Create a custom folder
  async createFolder(data: CreateFolderData): Promise<FolderWithClient> {
    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: data.name,
        clientId: data.clientId,
      },
    });
    if (existingFolder) {
      throw new Error("Folder with this name already exists for this client");
    }

    return await prisma.folder.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        type: data.type || "custom",
        clientId: data.clientId,
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

  // Get folder by ID with files
  async getFolderById(id: string): Promise<FolderWithFiles> {
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        files: {
          orderBy: { uploadedAt: "desc" },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            caseNumber: true,
          },
        },
      },
    });

    if (!folder) {
      throw new Error("Folder not found");
    }

    return folder;
  },

  // {
  //   id: 'case-files',
  //   name: 'Case Files',
  //   type: "case_files",
  //   description: 'Legal documents, court filings, and case-related paperwork',
  //   isDefault: true,
  // },
  // {
  //   id: 'identity-files',
  //   name: 'Identity Files',
  //   type: "identity_files"
  //   description: 'Client identification documents and personal records',
  //   isDefault: true,
  // },
  // {
  //   id: 'evidences',
  //   name: 'Evidences',
  //   type: "evidences",
  //   description: 'Evidence materials, photos, recordings, and supporting documents',
  //   isDefault: true,
  // },
  // {
  //   id: 'contracts',
  //   name: 'Contracts',
  //   type: "contracts",
  //   description: 'Legal contracts, agreements, and binding documents',
  //   isDefault: true,
  // },

  async createDefaultFolders(clientId: string) {
    const defaultFolderNames = [
      {
        name: "Case Files",
        description: "Legal documents, court filings, and case-related paperwork",
      },
      {
        name: "Identity Files",
        description: "Client identification documents and personal records",
      },
      {
        name: "Evidences",
        description: "Evidence materials, photos, recordings, and supporting documents",
      },
      {
        name: "Contracts",
        description: "Legal contracts, agreements, and binding documents",
      },
    ];
    const createFolderPromises = defaultFolderNames.map((folder) =>
      prisma.folder.create({
        data: { 
          name: folder.name,
          type: "default",
          clientId,
          description: folder.description,
        },
      })
    );

    await Promise.all(createFolderPromises);
  },

  // Get all folders for a client
  async getFoldersByClientId(
    clientId: string,
    paginationParams?: PaginationParams
  ) {
    const page = paginationParams?.page || 1;
    const limit = paginationParams?.limit || 10;
    const skip = (page - 1) * limit;

    const [folders, total] = await Promise.all([
      prisma.folder.findMany({
        where: { clientId },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              caseNumber: true,
            },
          },
          files: {
            orderBy: { uploadedAt: "desc" },
            take: 5,
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.folder.count({ where: { clientId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: folders,
      pagination: { page, limit, total, totalPages },
    };
  },

  // Add these methods to your existing folderService

  // Update folder name
  async updateFolder(
    id: string,
    data: UpdateFolderData
  ): Promise<FolderWithClient> {
    // Check if folder exists
    const existingFolder = await prisma.folder.findUnique({
      where: { id },
    });

    if (!existingFolder) {
      throw new Error("Folder not found");
    }

    // Prevent renaming default folders
    if (existingFolder.type === "default") {
      throw new Error("Cannot rename default folders");
    }

    // Check if folder with new name already exists for this client
    const whereClause: any = {
      clientId: existingFolder.clientId,
      id: { not: id },
    };
    if (typeof data.name === "string") {
      whereClause.name = data.name;
    }
    const duplicateFolder = await prisma.folder.findFirst({
      where: whereClause,
    });

    if (duplicateFolder) {
      throw new Error("Folder with this name already exists for this client");
    }

    return await prisma.folder.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
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

  // Delete folder
  async deleteFolder(id: string): Promise<void> {
    // Check if folder exists
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        files: {
          take: 1,
        },
      },
    });

    if (!folder) {
      throw new Error("Folder not found");
    }

    // Prevent deleting default folders
    if (folder.type === "default") {
      throw new Error("Cannot delete default folders");
    }

    // Prevent deleting folders with files
    if (folder.files.length > 0) {
      throw new Error("Cannot delete folder that contains files");
    }

    await prisma.folder.delete({
      where: { id },
    });
  },

  // Search folders by name with pagination
  async searchFolders(
    clientId: string,
    searchTerm: string,
    paginationParams?: PaginationParams
  ) {
    const page = paginationParams?.page || 1;
    const limit = paginationParams?.limit || 10;
    const skip = (page - 1) * limit;

    const sortBy = paginationParams?.sortBy || "name";
    const sortOrder = paginationParams?.sortOrder || "asc";

    const [folders, total] = await Promise.all([
      prisma.folder.findMany({
        where: {
          clientId,
          OR: [
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } },
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
          files: {
            orderBy: { uploadedAt: "desc" },
            take: 5,
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.folder.count({
        where: {
          clientId,
          name: { contains: searchTerm },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: folders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  // Get folder statistics for a client
  async getFolderStatistics(clientId: string) {
    const totalFolders = await prisma.folder.count({
      where: { clientId },
    });

    const foldersByType = await prisma.folder.groupBy({
      by: ["type"],
      _count: {
        type: true,
      },
      where: { clientId },
    });

    const foldersWithFileCounts = await prisma.folder.findMany({
      where: { clientId },
      include: {
        _count: {
          select: { files: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      totalFolders,
      byType: foldersByType,
      folders: foldersWithFileCounts.map((folder) => ({
        id: folder.id,
        name: folder.name,
        type: folder.type,
        fileCount: folder._count.files,
      })),
    };
  },
};
