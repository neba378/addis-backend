import { PrismaClient } from '@prisma/client';
import { CreateArbitratorDto, UpdateArbitratorDto, Arbitrator } from '../../../types/arbitration';

const prisma = new PrismaClient();

export class ArbitratorService {
  async createArbitrator(data: CreateArbitratorDto): Promise<Arbitrator> {
    const arbitrator = await prisma.arbitrator.create({
      data: {
        fullName: data.fullName,
        profilePicture: data.profilePicture || null,
        location: data.location,
        languages: JSON.stringify(data.languages),
        specializationAreas: JSON.stringify(data.specializationAreas),
        yearsOfExperience: data.yearsOfExperience,
        description: data.description,
      },
    });

    return {
      id: arbitrator.id,
      fullName: arbitrator.fullName,
      profilePicture: arbitrator.profilePicture,
      location: arbitrator.location,
      languages: JSON.parse(arbitrator.languages),
      specializationAreas: JSON.parse(arbitrator.specializationAreas),
      yearsOfExperience: arbitrator.yearsOfExperience,
      description: arbitrator.description,
      isActive: arbitrator.isActive,
      createdAt: arbitrator.createdAt,
      updatedAt: arbitrator.updatedAt,
    };
  }

  async getAllArbitrators(): Promise<Arbitrator[]> {
    const arbitrators = await prisma.arbitrator.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return arbitrators.map(arbitrator => ({
      id: arbitrator.id,
      fullName: arbitrator.fullName,
      profilePicture: arbitrator.profilePicture,
      location: arbitrator.location,
      languages: JSON.parse(arbitrator.languages),
      specializationAreas: JSON.parse(arbitrator.specializationAreas),
      yearsOfExperience: arbitrator.yearsOfExperience,
      description: arbitrator.description,
      isActive: arbitrator.isActive,
      createdAt: arbitrator.createdAt,
      updatedAt: arbitrator.updatedAt,
    }));
  }

  async getArbitratorById(id: string): Promise<Arbitrator | null> {
    const arbitrator = await prisma.arbitrator.findUnique({
      where: { id },
    });

    if (!arbitrator) {
      return null;
    }

    return {
      id: arbitrator.id,
      fullName: arbitrator.fullName,
      profilePicture: arbitrator.profilePicture,
      location: arbitrator.location,
      languages: JSON.parse(arbitrator.languages),
      specializationAreas: JSON.parse(arbitrator.specializationAreas),
      yearsOfExperience: arbitrator.yearsOfExperience,
      description: arbitrator.description,
      isActive: arbitrator.isActive,
      createdAt: arbitrator.createdAt,
      updatedAt: arbitrator.updatedAt,
    };
  }

  async updateArbitrator(id: string, data: UpdateArbitratorDto): Promise<Arbitrator | null> {
    const updateData: any = {};
    
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.languages !== undefined) updateData.languages = JSON.stringify(data.languages);
    if (data.specializationAreas !== undefined) updateData.specializationAreas = JSON.stringify(data.specializationAreas);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.yearsOfExperience !== undefined) updateData.yearsOfExperience = data.yearsOfExperience;
    
    const arbitrator = await prisma.arbitrator.update({
      where: { id },
      data: updateData,
    });

    return {
      id: arbitrator.id,
      fullName: arbitrator.fullName,
      profilePicture: arbitrator.profilePicture,
      location: arbitrator.location,
      languages: JSON.parse(arbitrator.languages),
      specializationAreas: JSON.parse(arbitrator.specializationAreas),
      yearsOfExperience: arbitrator.yearsOfExperience,
      description: arbitrator.description,
      isActive: arbitrator.isActive,
      createdAt: arbitrator.createdAt,
      updatedAt: arbitrator.updatedAt,
    };
  }

  async deleteArbitrator(id: string): Promise<boolean> {
    try {
      await prisma.arbitrator.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async toggleArbitratorStatus(id: string): Promise<Arbitrator | null> {
    const arbitrator = await prisma.arbitrator.findUnique({
      where: { id },
    });

    if (!arbitrator) {
      return null;
    }

    const updatedArbitrator = await prisma.arbitrator.update({
      where: { id },
      data: { isActive: !arbitrator.isActive },
    });

    return {
      id: updatedArbitrator.id,
      fullName: updatedArbitrator.fullName,
      profilePicture: updatedArbitrator.profilePicture,
      location: updatedArbitrator.location,
      languages: JSON.parse(updatedArbitrator.languages),
      specializationAreas: JSON.parse(updatedArbitrator.specializationAreas),
      yearsOfExperience: updatedArbitrator.yearsOfExperience,
      description: updatedArbitrator.description,
      isActive: updatedArbitrator.isActive,
      createdAt: updatedArbitrator.createdAt,
      updatedAt: updatedArbitrator.updatedAt,
    };
  }

  async getActiveArbitrators(): Promise<Arbitrator[]> {
    const arbitrators = await prisma.arbitrator.findMany({
      where: { isActive: true },
      orderBy: { fullName: 'asc' },
    });

    return arbitrators.map(arbitrator => ({
      id: arbitrator.id,
      fullName: arbitrator.fullName,
      profilePicture: arbitrator.profilePicture,
      location: arbitrator.location,
      languages: JSON.parse(arbitrator.languages),
      specializationAreas: JSON.parse(arbitrator.specializationAreas),
      yearsOfExperience: arbitrator.yearsOfExperience,
      description: arbitrator.description,
      isActive: arbitrator.isActive,
      createdAt: arbitrator.createdAt,
      updatedAt: arbitrator.updatedAt,
    }));
  }

  async getArbitratorStats(): Promise<{ total: number; active: number }> {
    const [total, active] = await Promise.all([
      prisma.arbitrator.count(),
      prisma.arbitrator.count({ where: { isActive: true } }),
    ]);

    return { total, active };
  }
} 