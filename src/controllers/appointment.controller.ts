// controllers/appointmentController.ts

import { Request, Response } from "express";
import { appointmentService } from "../services/appointment.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../utils/response";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentSearchInput,
  AppointmentIdParams,
  StatusParams,
  CalendarViewInput,
  UpdateAppointmentStatusInput,
} from "../validations/appointment.validation";
import { AuthRequest } from "../middlewares/auth.middleware";

export const appointmentController = {
  // Create a new appointment - Anyone can create
  async createAppointment(req: AuthRequest, res: Response) {
    try {
      const validatedData = CreateAppointmentInput.parse(req.body);
      const userId = req.user!.id; // Get the authenticated user ID

      const appointment = await appointmentService.createAppointment({
        ...validatedData,
        userId, // Include the user ID who created the appointment
      });

      successResponse(
        res,
        appointment,
        "Appointment created successfully",
        201
      );
    } catch (error: any) {
      if (error.name === "ZodError") {
        return errorResponse(res, "Validation failed", 400, error.errors);
      }
      if (error.message === "Client not found") {
        return errorResponse(res, error.message, 404);
      }
      errorResponse(res, "Failed to create appointment", 500, error.message);
    }
  },

  // Get appointment by ID - Users can only see their own appointments
  async getAppointment(req: AuthRequest, res: Response) {
    try {
      const { id } = AppointmentIdParams.parse(req.params);
      const userId = req.user!.id; // Get the authenticated user ID

      const appointment = await appointmentService.getAppointmentById(
        id,
        userId
      );

      if (!appointment) {
        return notFoundResponse(res, "Appointment not found");
      }

      successResponse(res, appointment, "Appointment retrieved successfully");
    } catch (error: any) {
      if (error.name === "ZodError") {
        return errorResponse(res, "Validation failed", 400, error.errors);
      }
      errorResponse(res, "Failed to retrieve appointment", 500, error.message);
    }
  },

  // Get all appointments for the authenticated user (starting from last month)
  async getAppointments(req: AuthRequest, res: Response) {
    try {
      const validatedQuery = AppointmentSearchInput.parse(req.query);
      const userId = req.user!.id; // Get the authenticated user ID

      const appointments = await appointmentService.getAppointments({
        ...validatedQuery,
        userId, // Filter by user's appointments
      });

      successResponse(res, appointments, "Appointments retrieved successfully");
    } catch (error: any) {
      if (error.name === "ZodError") {
        return errorResponse(res, "Validation failed", 400, error.errors);
      }
      errorResponse(res, "Failed to retrieve appointments", 500, error.message);
    }
  },

  // Get calendar view for authenticated user
  async getCalendarView(req: AuthRequest, res: Response) {
    try {
      const validatedQuery = CalendarViewInput.parse(req.query);
      const userId = req.user!.id; // Get the authenticated user ID

      const appointments = await appointmentService.getAppointmentsForCalendar(
        validatedQuery.startDate,
        validatedQuery.endDate,
        userId
      );

      successResponse(
        res,
        appointments,
        "Calendar data retrieved successfully"
      );
    } catch (error: any) {
      if (error.name === "ZodError") {
        return errorResponse(res, "Validation failed", 400, error.errors);
      }
      errorResponse(
        res,
        "Failed to retrieve calendar data",
        500,
        error.message
      );
    }
  },

  // Update appointment - Users can only update their own appointments
  async updateAppointment(req: AuthRequest, res: Response) {
    try {
      const { id } = AppointmentIdParams.parse(req.params);
      const validatedData = UpdateAppointmentInput.parse(req.body);
      const userId = req.user!.id; // Get the authenticated user ID

      const appointment = await appointmentService.updateAppointment(
        id,
        validatedData,
        userId
      );

      successResponse(res, appointment, "Appointment updated successfully");
    } catch (error: any) {
      if (error.name === "ZodError") {
        return errorResponse(res, "Validation failed", 400, error.errors);
      }
      if (error.message === "Appointment not found") {
        return notFoundResponse(res, error.message);
      }
      if (error.message.includes("Forbidden")) {
        return errorResponse(
          res,
          "You can only update your own appointments",
          403
        );
      }
      errorResponse(res, "Failed to update appointment", 500, error.message);
    }
  },

  // Delete appointment - Users can only delete their own appointments
  async deleteAppointment(req: AuthRequest, res: Response) {
    try {
      const { id } = AppointmentIdParams.parse(req.params);
      const userId = req.user!.id; // Get the authenticated user ID

      await appointmentService.deleteAppointment(id, userId);

      successResponse(res, null, "Appointment deleted successfully");
    } catch (error: any) {
      if (error.name === "ZodError") {
        return errorResponse(res, "Validation failed", 400, error.errors);
      }
      if (error.message === "Appointment not found") {
        return notFoundResponse(res, error.message);
      }
      if (error.message.includes("Forbidden")) {
        return errorResponse(
          res,
          "You can only delete your own appointments",
          403
        );
      }
      errorResponse(res, "Failed to delete appointment", 500, error.message);
    }
  },

  // Update appointment status - Users can only update their own appointments
  async updateAppointmentStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = AppointmentIdParams.parse(req.params);
      const { status } = UpdateAppointmentStatusInput.parse(req.body);
      const userId = req.user!.id; // Get the authenticated user ID

      const appointment = await appointmentService.updateAppointmentStatus(
        id,
        status,
        userId
      );

      successResponse(
        res,
        appointment,
        "Appointment status updated successfully"
      );
    } catch (error: any) {
      if (error.name === "ZodError") {
        return errorResponse(res, "Validation failed", 400, error.errors);
      }
      if (error.message === "Appointment not found") {
        return notFoundResponse(res, error.message);
      }
      if (error.message.includes("Forbidden")) {
        return errorResponse(
          res,
          "You can only update your own appointments",
          403
        );
      }
      errorResponse(
        res,
        "Failed to update appointment status",
        500,
        error.message
      );
    }
  },

  // Get appointments by status for authenticated user (starting from last month)
  async getAppointmentsByStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = StatusParams.parse(req.params);
      const userId = req.user!.id; // Get the authenticated user ID

      const appointments = await appointmentService.getAppointmentsByStatus(
        status,
        userId
      );

      successResponse(
        res,
        appointments,
        `${status} appointments retrieved successfully`
      );
    } catch (error: any) {
      if (error.name === "ZodError") {
        return errorResponse(res, "Validation failed", 400, error.errors);
      }
      errorResponse(res, "Failed to retrieve appointments", 500, error.message);
    }
  },

  // Get all appointments (for managers/admins to see all, starting from last month)
  async getAllAppointments(req: AuthRequest, res: Response) {
    try {
      const validatedQuery = AppointmentSearchInput.parse(req.query);

      // Only managers and admins can see all appointments
      const userRole = req.user!.role;
      if (!["MANAGER", "SUPER_ADMIN"].includes(userRole)) {
        return errorResponse(res, "Insufficient permissions", 403);
      }

      const appointments = await appointmentService.getAllAppointments({
        ...validatedQuery,
      });

      successResponse(
        res,
        appointments,
        "All appointments retrieved successfully"
      );
    } catch (error: any) {
      if (error.name === "ZodError") {
        return errorResponse(res, "Validation failed", 400, error.errors);
      }
      errorResponse(
        res,
        "Failed to retrieve all appointments",
        500,
        error.message
      );
    }
  },
};
