import prisma from "../config/db";
import {
  CreateClientData,
  UpdateClientData,
  ClientFilters,
  ClientWithRelations,
} from "../types/client.types";
import { PaginationParams, PaginatedResponse } from "../utils/response";
import { folderService } from "./folderService";

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

    // Create the client
    const client = await prisma.client.create({
      data: {
        fullName: data.fullName,
        caseNumber: caseNumber,
        phoneNumber: data.phoneNumber,
        appointmentDate: data.appointmentDate
          ? new Date(data.appointmentDate)
          : null,
        assignedLawyer:
          typeof data.assignedLawyer !== "undefined"
            ? data.assignedLawyer
            : null,
        court: typeof data.court !== "undefined" ? data.court : null,
        createdBy: data.createdBy,
        status: data.status || "Pending",
        notes: typeof data.notes !== "undefined" ? data.notes : null,
      },
    });

    // Create default folders for this client
    await folderService.createDefaultFolders(client.id);

    // Return the client with relations
    return this.getClientById(client.id);
  },

  // Get all clients with their folders and notes
  async getClients(
    paginationParams?: PaginationParams,
    filters?: ClientFilters
  ): Promise<PaginatedResponse<ClientWithRelations>> {
    const page = Number(paginationParams?.page) || 1;
    const limit = Number(paginationParams?.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = paginationParams?.sortBy || "createdAt";
    const sortOrder = paginationParams?.sortOrder || "desc";

    // Build where clause for filters
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.caseNumber)
      where.caseNumber = { contains: filters.caseNumber };
    if (filters?.lawyer) where.assignedLawyer = { contains: filters.lawyer };

    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search } },
        { caseNumber: { contains: filters.search } },
        { assignedLawyer: { contains: filters.search } },
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

  // Get client by ID with relations
  async getClientById(id: number): Promise<ClientWithRelations> {
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
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    return client;
  },

  // Update client
  async updateClient(
    id: number,
    data: UpdateClientData
  ): Promise<ClientWithRelations> {
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      throw new Error("Client not found");
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
    if (typeof data.assignedLawyer !== "undefined")
      updateData.assignedLawyer = data.assignedLawyer;
    if (typeof data.court !== "undefined") updateData.court = data.court;
    if (typeof data.status !== "undefined") updateData.status = data.status;

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return this.getClientById(client.id);
  },

  // Delete client
  async deleteClient(id: number): Promise<void> {
    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    await prisma.client.delete({
      where: { id },
    });
  },

  // Search clients with filters
  async searchClients(
    filters: ClientFilters,
    paginationParams?: PaginationParams
  ): Promise<PaginatedResponse<ClientWithRelations>> {
    return this.getClients(paginationParams, filters);
  },

  // Get clients by status
  async getClientsByStatus(
    status: string,
    paginationParams?: PaginationParams
  ): Promise<PaginatedResponse<ClientWithRelations>> {
    return this.getClients(paginationParams, { status });
  },

  // Get clients by lawyer
  async getClientsByLawyer(
    lawyer: string,
    paginationParams?: PaginationParams
  ): Promise<PaginatedResponse<ClientWithRelations>> {
    return this.getClients(paginationParams, { lawyer });
  },

  // Get client statistics
  async getClientStatistics() {
    const totalClients = await prisma.client.count();

    const clientsByStatus = await prisma.client.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const clientsByLawyer = await prisma.client.groupBy({
      by: ["assignedLawyer"],
      _count: {
        assignedLawyer: true,
      },
      where: {
        assignedLawyer: { not: null },
      },
    });

    const recentClients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        fullName: true,
        caseNumber: true,
        status: true,
        createdAt: true,
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
