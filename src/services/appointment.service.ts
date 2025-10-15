// services/appointmentService.ts

import { PrismaClient } from "@prisma/client";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentSearchInput,
} from "../validations/appointment.validation";

const prisma = new PrismaClient();

export class AppointmentService {
  // Create new appointment - no restrictions
  async createAppointment(data: CreateAppointmentInput & { userId: string }) {
    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: data.caseId },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    // Auto-update status based on date
    const appointmentDate = new Date(data.date);
    const today = new Date();

    let status = data.status || "upcoming";
    if (appointmentDate < today && status === "upcoming") {
      status = "expired";
    }

    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        status,
        date: appointmentDate,
        userId: data.userId,
        description: data.description === undefined ? null : data.description,
        location: data.location === undefined ? null : data.location,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            caseNumber: true,
            phoneNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return appointment;
  }

  // Get appointment by ID - user can only see their own
  async getAppointmentById(id: string, userId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
        userId, // Users can only see their own appointments
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            caseNumber: true,
            phoneNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return appointment;
  }

  // Get all appointments starting from last month
  async getAppointments(filters: AppointmentSearchInput & { userId?: string }) {
    const { startDate, endDate, status, appointmentWith, caseId, userId } =
      filters;

    // Default: start from last month
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);

    // Build where clause
    const where: any = {
      date: {
        gte: startDate ? new Date(startDate) : defaultStartDate,
        ...(endDate && { lte: new Date(endDate) }),
      },
      ...(status && { status }),
      ...(appointmentWith && { appointmentWith }),
      ...(caseId && { caseId }),
      ...(userId && { userId }), // Filter by user if provided
    };

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            caseNumber: true,
            phoneNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return appointments;
  }

  // Get appointments for calendar view
  async getAppointmentsForCalendar(
    startDate: string,
    endDate: string,
    userId: string
  ) {
    const appointments = await prisma.appointment.findMany({
      where: {
        userId, // User's appointments only
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            caseNumber: true,
            phoneNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group appointments by date
    const groupedAppointments: { [key: string]: any[] } = {};

    appointments.forEach((appointment) => {
      const dateKey = appointment.date?.toISOString().split("T")[0];
      if (typeof dateKey === "string") {
        if (!groupedAppointments[dateKey]) {
          groupedAppointments[dateKey] = [];
        }
        groupedAppointments[dateKey].push(appointment);
      }
    });

    return groupedAppointments;
  }

  // Update appointment - user can only update their own
  async updateAppointment(
    id: string,
    data: UpdateAppointmentInput,
    userId: string
  ) {
    // Check if appointment exists and belongs to user
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      throw new Error("Appointment not found");
    }

    if (existingAppointment.userId !== userId) {
      throw new Error("Forbidden: You can only update your own appointments");
    }

    // Prepare update data with proper undefined handling
    const updateData: any = {};

    // Only include fields that are provided
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.appointmentWith !== undefined)
      updateData.appointmentWith = data.appointmentWith;

    // Handle status with date-based auto-update
    let status = data.status;
    if (data.date) {
      const appointmentDate = new Date(data.date);
      const today = new Date();
      updateData.date = appointmentDate;

      if (
        appointmentDate < today &&
        (!data.status || data.status === "upcoming")
      ) {
        status = "expired";
      }
    }

    if (status !== undefined) updateData.status = status;

    // Handle caseId with validation
    if (data.caseId !== undefined) {
      // Verify new client exists
      const client = await prisma.client.findUnique({
        where: { id: data.caseId },
      });

      if (!client) {
        throw new Error("Client not found");
      }
      updateData.caseId = data.caseId;
    }

    return await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            caseNumber: true,
            phoneNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Delete appointment - user can only delete their own
  async deleteAppointment(id: string, userId: string) {
    // Check if appointment exists and belongs to user
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      throw new Error("Appointment not found");
    }

    if (existingAppointment.userId !== userId) {
      throw new Error("Forbidden: You can only delete your own appointments");
    }

    return await prisma.appointment.delete({
      where: { id },
    });
  }

  // Get appointments by status for a user
  async getAppointmentsByStatus(status: string, userId: string) {
    // Default: start from last month
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);

    return await prisma.appointment.findMany({
      where: {
        status,
        userId, // User's appointments only
        date: {
          gte: defaultStartDate,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            caseNumber: true,
            phoneNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });
  }

  // Update appointment status - user can only update their own
  async updateAppointmentStatus(
    id: string,
    status: "upcoming" | "expired" | "canceled" | "completed",
    userId: string
  ) {
    // Check if appointment exists and belongs to user
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      throw new Error("Appointment not found");
    }

    if (existingAppointment.userId !== userId) {
      throw new Error("Forbidden: You can only update your own appointments");
    }

    return await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            caseNumber: true,
            phoneNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Get all appointments for managers/admins (starting from last month)
  async getAllAppointments(
    filters: Omit<AppointmentSearchInput, "userId"> = {}
  ) {
    const { startDate, endDate, status, appointmentWith, caseId } = filters;

    // Default: start from last month
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);

    const where: any = {
      date: {
        gte: startDate ? new Date(startDate) : defaultStartDate,
        ...(endDate && { lte: new Date(endDate) }),
      },
      ...(status && { status }),
      ...(appointmentWith && { appointmentWith }),
      ...(caseId && { caseId }),
    };

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            caseNumber: true,
            phoneNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return appointments;
  }
}

export const appointmentService = new AppointmentService();
