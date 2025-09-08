import { PrismaClient } from '@prisma/client';
import { CreateArbitrationRequestDto, UpdateArbitrationRequestDto, ArbitrationRequest, RequestStatus } from '../../../types/arbitration';

const prisma = new PrismaClient();

export class ArbitrationRequestService {
  async createRequest(data: CreateArbitrationRequestDto): Promise<ArbitrationRequest> {
    const request = await prisma.arbitrationRequest.create({
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        emailAddress: data.emailAddress || null,
        location: data.location || null,
        preferredLanguages: data.preferredLanguages ? JSON.stringify(data.preferredLanguages) : null,
        typeOfDispute: data.typeOfDispute,
        disputeSummary: data.disputeSummary,
        preferredArbitratorId: data.preferredArbitratorId || null,
      },
      include: {
        preferredArbitrator: true,
      },
    });

    return {
      id: request.id,
      fullName: request.fullName,
      phoneNumber: request.phoneNumber,
      emailAddress: request.emailAddress,
      location: request.location,
      preferredLanguages: request.preferredLanguages ? JSON.parse(request.preferredLanguages) : null,
      typeOfDispute: request.typeOfDispute,
      disputeSummary: request.disputeSummary,
      preferredArbitratorId: request.preferredArbitratorId,
      status: request.status as RequestStatus,
      adminNotes: request.adminNotes,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      preferredArbitrator: request.preferredArbitrator ? {
        id: request.preferredArbitrator.id,
        fullName: request.preferredArbitrator.fullName,
        profilePicture: request.preferredArbitrator.profilePicture,
        location: request.preferredArbitrator.location,
        languages: JSON.parse(request.preferredArbitrator.languages),
        specializationAreas: JSON.parse(request.preferredArbitrator.specializationAreas),
        yearsOfExperience: request.preferredArbitrator.yearsOfExperience,
        description: request.preferredArbitrator.description,
        isActive: request.preferredArbitrator.isActive,
        createdAt: request.preferredArbitrator.createdAt,
        updatedAt: request.preferredArbitrator.updatedAt,
      } : null,
    };
  }

  async getAllRequests(): Promise<ArbitrationRequest[]> {
    const requests = await prisma.arbitrationRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        preferredArbitrator: true,
      },
    });

    return requests.map(request => ({
      id: request.id,
      fullName: request.fullName,
      phoneNumber: request.phoneNumber,
      emailAddress: request.emailAddress,
      location: request.location,
      preferredLanguages: request.preferredLanguages ? JSON.parse(request.preferredLanguages) : null,
      typeOfDispute: request.typeOfDispute,
      disputeSummary: request.disputeSummary,
      preferredArbitratorId: request.preferredArbitratorId,
      status: request.status as RequestStatus,
      adminNotes: request.adminNotes,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      preferredArbitrator: request.preferredArbitrator ? {
        id: request.preferredArbitrator.id,
        fullName: request.preferredArbitrator.fullName,
        profilePicture: request.preferredArbitrator.profilePicture,
        location: request.preferredArbitrator.location,
        languages: JSON.parse(request.preferredArbitrator.languages),
        specializationAreas: JSON.parse(request.preferredArbitrator.specializationAreas),
        yearsOfExperience: request.preferredArbitrator.yearsOfExperience,
        description: request.preferredArbitrator.description,
        isActive: request.preferredArbitrator.isActive,
        createdAt: request.preferredArbitrator.createdAt,
        updatedAt: request.preferredArbitrator.updatedAt,
      } : null,
    }));
  }

  async getRequestById(id: string): Promise<ArbitrationRequest | null> {
    const request = await prisma.arbitrationRequest.findUnique({
      where: { id },
      include: {
        preferredArbitrator: true,
      },
    });

    if (!request) {
      return null;
    }

    return {
      id: request.id,
      fullName: request.fullName,
      phoneNumber: request.phoneNumber,
      emailAddress: request.emailAddress,
      location: request.location,
      preferredLanguages: request.preferredLanguages ? JSON.parse(request.preferredLanguages) : null,
      typeOfDispute: request.typeOfDispute,
      disputeSummary: request.disputeSummary,
      preferredArbitratorId: request.preferredArbitratorId,
      status: request.status as RequestStatus,
      adminNotes: request.adminNotes,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      preferredArbitrator: request.preferredArbitrator ? {
        id: request.preferredArbitrator.id,
        fullName: request.preferredArbitrator.fullName,
        profilePicture: request.preferredArbitrator.profilePicture,
        location: request.preferredArbitrator.location,
        languages: JSON.parse(request.preferredArbitrator.languages),
        specializationAreas: JSON.parse(request.preferredArbitrator.specializationAreas),
        yearsOfExperience: request.preferredArbitrator.yearsOfExperience,
        description: request.preferredArbitrator.description,
        isActive: request.preferredArbitrator.isActive,
        createdAt: request.preferredArbitrator.createdAt,
        updatedAt: request.preferredArbitrator.updatedAt,
      } : null,
    };
  }

  async updateRequest(id: string, data: UpdateArbitrationRequestDto): Promise<ArbitrationRequest | null> {
    const updateData: any = {};
    
    if (data.status !== undefined) updateData.status = data.status;
    if (data.adminNotes !== undefined) updateData.adminNotes = data.adminNotes;
    if (data.preferredArbitratorId !== undefined) updateData.preferredArbitratorId = data.preferredArbitratorId;

    const request = await prisma.arbitrationRequest.update({
      where: { id },
      data: updateData,
      include: {
        preferredArbitrator: true,
      },
    });

    return {
      id: request.id,
      fullName: request.fullName,
      phoneNumber: request.phoneNumber,
      emailAddress: request.emailAddress,
      location: request.location,
      preferredLanguages: request.preferredLanguages ? JSON.parse(request.preferredLanguages) : null,
      typeOfDispute: request.typeOfDispute,
      disputeSummary: request.disputeSummary,
      preferredArbitratorId: request.preferredArbitratorId,
      status: request.status as RequestStatus,
      adminNotes: request.adminNotes,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      preferredArbitrator: request.preferredArbitrator ? {
        id: request.preferredArbitrator.id,
        fullName: request.preferredArbitrator.fullName,
        profilePicture: request.preferredArbitrator.profilePicture,
        location: request.preferredArbitrator.location,
        languages: JSON.parse(request.preferredArbitrator.languages),
        specializationAreas: JSON.parse(request.preferredArbitrator.specializationAreas),
        yearsOfExperience: request.preferredArbitrator.yearsOfExperience,
        description: request.preferredArbitrator.description,
        isActive: request.preferredArbitrator.isActive,
        createdAt: request.preferredArbitrator.createdAt,
        updatedAt: request.preferredArbitrator.updatedAt,
      } : null,
    };
  }

  async deleteRequest(id: string): Promise<boolean> {
    try {
      await prisma.arbitrationRequest.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateRequestStatus(id: string, status: RequestStatus): Promise<ArbitrationRequest | null> {
    const request = await prisma.arbitrationRequest.update({
      where: { id },
      data: { status },
      include: {
        preferredArbitrator: true,
      },
    });

    return {
      id: request.id,
      fullName: request.fullName,
      phoneNumber: request.phoneNumber,
      emailAddress: request.emailAddress,
      location: request.location,
      preferredLanguages: request.preferredLanguages ? JSON.parse(request.preferredLanguages) : null,
      typeOfDispute: request.typeOfDispute,
      disputeSummary: request.disputeSummary,
      preferredArbitratorId: request.preferredArbitratorId,
      status: request.status as RequestStatus,
      adminNotes: request.adminNotes,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      preferredArbitrator: request.preferredArbitrator ? {
        id: request.preferredArbitrator.id,
        fullName: request.preferredArbitrator.fullName,
        profilePicture: request.preferredArbitrator.profilePicture,
        location: request.preferredArbitrator.location,
        languages: JSON.parse(request.preferredArbitrator.languages),
        specializationAreas: JSON.parse(request.preferredArbitrator.specializationAreas),
        yearsOfExperience: request.preferredArbitrator.yearsOfExperience,
        description: request.preferredArbitrator.description,
        isActive: request.preferredArbitrator.isActive,
        createdAt: request.preferredArbitrator.createdAt,
        updatedAt: request.preferredArbitrator.updatedAt,
      } : null,
    };
  }

  async assignArbitrator(id: string, arbitratorId: string): Promise<ArbitrationRequest | null> {
    const request = await prisma.arbitrationRequest.update({
      where: { id },
      data: { 
        preferredArbitratorId: arbitratorId,
        status: 'ASSIGNED' as RequestStatus,
      },
      include: {
        preferredArbitrator: true,
      },
    });

    return {
      id: request.id,
      fullName: request.fullName,
      phoneNumber: request.phoneNumber,
      emailAddress: request.emailAddress,
      location: request.location,
      preferredLanguages: request.preferredLanguages ? JSON.parse(request.preferredLanguages) : null,
      typeOfDispute: request.typeOfDispute,
      disputeSummary: request.disputeSummary,
      preferredArbitratorId: request.preferredArbitratorId,
      status: request.status as RequestStatus,
      adminNotes: request.adminNotes,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      preferredArbitrator: request.preferredArbitrator ? {
        id: request.preferredArbitrator.id,
        fullName: request.preferredArbitrator.fullName,
        profilePicture: request.preferredArbitrator.profilePicture,
        location: request.preferredArbitrator.location,
        languages: JSON.parse(request.preferredArbitrator.languages),
        specializationAreas: JSON.parse(request.preferredArbitrator.specializationAreas),
        yearsOfExperience: request.preferredArbitrator.yearsOfExperience,
        description: request.preferredArbitrator.description,
        isActive: request.preferredArbitrator.isActive,
        createdAt: request.preferredArbitrator.createdAt,
        updatedAt: request.preferredArbitrator.updatedAt,
      } : null,
    };
  }

  async getRequestStats(): Promise<{ total: number; pending: number; completed: number; requestsByStatus: Record<RequestStatus, number> }> {
    const [total, pending, completed, statusCounts] = await Promise.all([
      prisma.arbitrationRequest.count(),
      prisma.arbitrationRequest.count({ where: { status: 'PENDING' } }),
      prisma.arbitrationRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.arbitrationRequest.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const requestsByStatus: Record<RequestStatus, number> = {
      PENDING: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    statusCounts.forEach(({ status, _count }) => {
      requestsByStatus[status as RequestStatus] = _count;
    });

    return { total, pending, completed, requestsByStatus };
  }

  async getRequestsByArbitrator(arbitratorId: string): Promise<ArbitrationRequest[]> {
    const requests = await prisma.arbitrationRequest.findMany({
      where: { preferredArbitratorId: arbitratorId },
      orderBy: { createdAt: 'desc' },
      include: {
        preferredArbitrator: true,
      },
    });

    return requests.map(request => ({
      id: request.id,
      fullName: request.fullName,
      phoneNumber: request.phoneNumber,
      emailAddress: request.emailAddress,
      location: request.location,
      preferredLanguages: request.preferredLanguages ? JSON.parse(request.preferredLanguages) : null,
      typeOfDispute: request.typeOfDispute,
      disputeSummary: request.disputeSummary,
      preferredArbitratorId: request.preferredArbitratorId,
      status: request.status as RequestStatus,
      adminNotes: request.adminNotes,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      preferredArbitrator: request.preferredArbitrator ? {
        id: request.preferredArbitrator.id,
        fullName: request.preferredArbitrator.fullName,
        profilePicture: request.preferredArbitrator.profilePicture,
        location: request.preferredArbitrator.location,
        languages: JSON.parse(request.preferredArbitrator.languages),
        specializationAreas: JSON.parse(request.preferredArbitrator.specializationAreas),
        yearsOfExperience: request.preferredArbitrator.yearsOfExperience,
        description: request.preferredArbitrator.description,
        isActive: request.preferredArbitrator.isActive,
        createdAt: request.preferredArbitrator.createdAt,
        updatedAt: request.preferredArbitrator.updatedAt,
      } : null,
    }));
  }
} 