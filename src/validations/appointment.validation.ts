// validations/appointment.validation.ts

import { z } from "zod";

export const appointmentStatusEnum = z.enum([
  "upcoming",
  "expired",
  "canceled",
  "completed",
]);
export const appointmentWithEnum = z.enum(["court", "client", "both"]);

export const CreateAppointmentInput = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  status: appointmentStatusEnum.optional().default("upcoming"),
  location: z.string().optional(),
  appointmentWith: appointmentWithEnum,
  caseId: z.string().uuid("Invalid client ID"),
  date: z.string().datetime("Invalid date format"),
});

export const UpdateAppointmentInput = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title too long")
    .optional(),
  description: z.string().optional(),
  status: appointmentStatusEnum.optional(),
  location: z.string().optional(),
  appointmentWith: appointmentWithEnum.optional(),
  caseId: z.string().uuid("Invalid client ID").optional(),
  date: z.string().datetime("Invalid date format").optional(),
});

export const AppointmentIdParams = z.object({
  id: z.string().uuid("Invalid appointment ID"),
});

export const StatusParams = z.object({
  status: appointmentStatusEnum,
});

export const AppointmentSearchInput = z.object({
  startDate: z.string().datetime("Invalid start date").optional(),
  endDate: z.string().datetime("Invalid end date").optional(),
  status: appointmentStatusEnum.optional(),
  appointmentWith: appointmentWithEnum.optional(),
  caseId: z.string().uuid("Invalid client ID").optional(),
});

export const CalendarViewInput = z.object({
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
});

export const UpdateAppointmentStatusInput = z.object({
  status: appointmentStatusEnum,
});

// Type inference
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentInput>;
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentInput>;
export type AppointmentIdParams = z.infer<typeof AppointmentIdParams>;
export type StatusParams = z.infer<typeof StatusParams>;
export type AppointmentSearchInput = z.infer<typeof AppointmentSearchInput>;
export type CalendarViewInput = z.infer<typeof CalendarViewInput>;
export type UpdateAppointmentStatusInput = z.infer<
  typeof UpdateAppointmentStatusInput
>;
