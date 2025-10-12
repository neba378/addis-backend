import prisma from "../config/db";
import {
  CreateClientData,
  UpdateClientData,
  ClientFilters,
  ClientWithRelations,
} from "../types/client.types";
import { PaginationParams, PaginatedResponse } from "../utils/response";
import { folderService } from "./folderService";
import { UserRole } from "@prisma/client";

export const clientService = {
  // Generate temporary case number
  generateTempCaseNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `TEMP-${timestamp}-${random}`.toUpperCase();
  },

  // Create a new client with default folders
  async createClient(data: CreateClientData): Promise<ClientWithRelations> {
    // Generate temporary case number if not provided
    const caseNumber = data.caseNumber || this.generateTempCaseNumber();

    // Check if case number already exists (if provided)
    if (data.caseNumber) {
      const existingClient = await prisma.client.findUnique({
        where: { caseNumber: data.caseNumber },
      });

      if (existingClient) {
        throw new Error("Case number already exists");
      }
    }

    // Use Prisma's exact type structure
    const createData = {
      fullName: data.fullName,
      caseNumber: caseNumber,
      phoneNumber: data.phoneNumber,
      appointmentDate: data.appointmentDate
        ? new Date(data.appointmentDate)
        : null,
      court: data.court ?? null,
      createdBy: data.createdBy,
      status: data.status || "Pending",
      notes: data.notes ?? null,
      ...(data.assignedLawyerId && {
        assignedLawyer: {
          connect: { id: data.assignedLawyerId },
        },
      }),
    };

    // Create the client
    const client = await prisma.client.create({
      data: createData,
    });

    // Create default folders for this client
    await folderService.createDefaultFolders(client.id);

    // Return the client with relations
    return this.getClientById(client.id);
  },

  // Get all clients with their folders and notes - WITH RBAC
  async getClients(
    paginationParams?: PaginationParams,
    filters?: ClientFilters,
    userRole?: UserRole,
    userId?: string
  ): Promise<PaginatedResponse<ClientWithRelations>> {
    const page = Number(paginationParams?.page) || 1;
    const limit = Number(paginationParams?.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = paginationParams?.sortBy || "createdAt";
    const sortOrder = paginationParams?.sortOrder || "desc";

    // Build where clause for filters AND RBAC
    const where: any = {};

    // RBAC: Lawyers can only see their assigned clients
    if (userRole === UserRole.LAWYER && userId) {
      where.assignedLawyerId = userId;
    }
    // Managers and Super Admins can see all clients (no additional filter)

    // Apply additional filters
    if (filters?.status) where.status = filters.status;
    if (filters?.caseNumber)
      where.caseNumber = { contains: filters.caseNumber };
    if (filters?.lawyer) where.assignedLawyer = { contains: filters.lawyer };

    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: "insensitive" } },
        { caseNumber: { contains: filters.search, mode: "insensitive" } },
        { assignedLawyer: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.startDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          folders: {
            orderBy: { name: "asc" },
          },
          clientNotes: {
            orderBy: { createdAt: "desc" },
            take: 3, // Only get recent notes for listing
          },
          assignedLawyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  // Get client by ID with relations - WITH RBAC
  async getClientById(
    id: string,
    userRole?: UserRole,
    userId?: string
  ): Promise<ClientWithRelations> {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        folders: {
          include: {
            files: {
              orderBy: { uploadedAt: "desc" },
            },
          },
          orderBy: { name: "asc" },
        },
        clientNotes: {
          orderBy: { createdAt: "desc" },
        },
        assignedLawyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    // RBAC: Lawyers can only access their assigned clients
    if (userRole === UserRole.LAWYER && client.assignedLawyerId !== userId) {
      throw new Error("Access denied");
    }

    return client;
  },

  // Update client - WITH RBAC
  async updateClient(
    id: string,
    data: UpdateClientData,
    userRole?: UserRole,
    userId?: string
  ): Promise<ClientWithRelations> {
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      throw new Error("Client not found");
    }

    // RBAC: Lawyers can only update their assigned clients
    if (
      userRole === UserRole.LAWYER &&
      existingClient.assignedLawyerId !== userId
    ) {
      throw new Error("Access denied");
    }

    // RBAC: Lawyers cannot change assigned lawyer
    if (
      userRole === UserRole.LAWYER &&
      data.assignedLawyerId &&
      data.assignedLawyerId !== existingClient.assignedLawyerId
    ) {
      throw new Error("Cannot change assigned lawyer");
    }

    // Check if case number is being updated and if it already exists
    if (data.caseNumber && data.caseNumber !== existingClient.caseNumber) {
      const clientWithCaseNumber = await prisma.client.findFirst({
        where: {
          caseNumber: data.caseNumber,
          id: { not: id },
        },
      });

      if (clientWithCaseNumber) {
        throw new Error("Case number already exists");
      }
    }

    // Only include defined fields in the update data
    const updateData: any = {};
    if (typeof data.fullName !== "undefined")
      updateData.fullName = data.fullName;
    if (typeof data.caseNumber !== "undefined")
      updateData.caseNumber = data.caseNumber;
    if (typeof data.phoneNumber !== "undefined")
      updateData.phoneNumber = data.phoneNumber;
    if (typeof data.appointmentDate !== "undefined")
      updateData.appointmentDate = data.appointmentDate
        ? new Date(data.appointmentDate)
        : null;
    if (typeof data.court !== "undefined") updateData.court = data.court;
    if (typeof data.status !== "undefined") updateData.status = data.status;

    // Handle assigned lawyer update (only for managers and super admins)
    if (typeof data.assignedLawyerId !== "undefined") {
      if (data.assignedLawyerId) {
        updateData.assignedLawyerId = {
          connect: { id: data.assignedLawyerId },
        };
      } else {
        updateData.assignedLawyerId = {
          disconnect: true,
        };
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return this.getClientById(client.id);
  },

  // Delete client - WITH RBAC (only managers and super admins)
  async deleteClient(id: string, userRole?: UserRole): Promise<void> {
    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    // RBAC: Only managers and super admins can delete clients
    if (userRole === UserRole.LAWYER) {
      throw new Error("Access denied");
    }

    await prisma.client.delete({
      where: { id },
    });
  },

  // Search clients with filters - WITH RBAC
  async searchClients(
    filters: ClientFilters,
    paginationParams?: PaginationParams,
    userRole?: UserRole,
    userId?: string
  ): Promise<PaginatedResponse<ClientWithRelations>> {
    return this.getClients(paginationParams, filters, userRole, userId);
  },

  // Get clients by status - WITH RBAC
  async getClientsByStatus(
    status: string,
    paginationParams?: PaginationParams,
    userRole?: UserRole,
    userId?: string
  ): Promise<PaginatedResponse<ClientWithRelations>> {
    return this.getClients(paginationParams, { status }, userRole, userId);
  },

  // Get clients by lawyer - WITH RBAC (only managers and super admins)
  async getClientsByLawyer(
    lawyerId: string,
    paginationParams?: PaginationParams,
    userRole?: UserRole
  ): Promise<PaginatedResponse<ClientWithRelations>> {
    // RBAC: Only managers and super admins can view clients by specific lawyer
    if (userRole === UserRole.LAWYER) {
      throw new Error("Access denied");
    }

    return this.getClients(paginationParams, { lawyer: lawyerId });
  },

  // Get client statistics - WITH RBAC
  async getClientStatistics(userRole?: UserRole, userId?: string) {
    // Build where condition based on RBAC
    let whereCondition: any = {};

    // Lawyers can only see statistics for their assigned clients
    if (userRole === UserRole.LAWYER && userId) {
      whereCondition.assignedLawyerId = userId;
    }

    const totalClients = await prisma.client.count({
      where: whereCondition,
    });

    const clientsByStatus = await prisma.client.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
      where: whereCondition,
    });

    const clientsByLawyer = await prisma.client.groupBy({
      by: ["assignedLawyerId"],
      _count: {
        assignedLawyerId: true,
      },
      where: {
        ...whereCondition,
        assignedLawyerId: { not: null },
      },
    });

    const recentClients = await prisma.client.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        fullName: true,
        caseNumber: true,
        status: true,
        createdAt: true,
        assignedLawyer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      totalClients,
      byStatus: clientsByStatus,
      byLawyer: clientsByLawyer,
      recentClients,
    };
  },

  // Check if case number exists
  async checkCaseNumberExists(caseNumber: string): Promise<boolean> {
    const client = await prisma.client.findUnique({
      where: { caseNumber },
    });

    return !!client;
  },
};
