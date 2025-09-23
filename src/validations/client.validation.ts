import { z } from "zod";

// Client creation validation schema
export const createClientSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters")
      .trim(),

    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 characters")
      .max(15, "Phone number must be less than 15 characters")
      .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),

    appointmentDate: z
      .string()
      .datetime()
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),

    assignedLawyer: z
      .string()
      .max(100, "Lawyer name must be less than 100 characters")
      .trim()
      .optional()
      .nullable(),

    court: z
      .string()
      .max(100, "Court name must be less than 100 characters")
      .trim()
      .optional()
      .nullable(),

    createdBy: z
      .string()
      .min(2, "Created by must be at least 2 characters")
      .max(100, "Created by must be less than 100 characters")
      .trim(),

    status: z.string().default("Pending").optional(),

    caseNumber: z
      .string()
      .max(50, "Case number must be less than 50 characters")
      .trim()
      .optional()
      .nullable(),

    notes: z
      .string()
      .max(2000, "Notes must be less than 2000 characters")
      .trim()
      .optional()
      .nullable(),
  }),
});

// Client update validation schema
export const updateClientSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters")
      .trim()
      .optional(),

    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 characters")
      .max(15, "Phone number must be less than 15 characters")
      .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
      .optional(),

    appointmentDate: z
      .string()
      .datetime()
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),

    assignedLawyer: z
      .string()
      .max(100, "Lawyer name must be less than 100 characters")
      .trim()
      .optional()
      .nullable(),

    court: z
      .string()
      .max(100, "Court name must be less than 100 characters")
      .trim()
      .optional()
      .nullable(),

    status: z.string().optional(),

    caseNumber: z
      .string()
      .max(50, "Case number must be less than 50 characters")
      .trim()
      .optional()
      .nullable(),

    notes: z
      .string()
      .max(2000, "Notes must be less than 2000 characters")
      .trim()
      .optional()
      .nullable(),
  }),
});

// Client search/filter validation schema
export const clientSearchSchema = z.object({
  query: z.object({
    q: z
      .string()
      .max(100, "Search query must be less than 100 characters")
      .trim()
      .optional(),

    status: z.string().optional(),

    lawyer: z.string().optional(),

    startDate: z.string().datetime().optional(),

    page: z
      .string()
      .regex(/^\d+$/, "Page must be a number")
      .transform(Number)
      .optional()
      .default("1"),

    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a number")
      .transform(Number)
      .optional()
      .default("10"),

    sortBy: z.string().optional().default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

// Params validation schemas
export const clientIdParamsSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, "Client ID is required")
      .regex(/^\d+$/, "Client ID must be a number")
      .transform(Number),
  }),
});

// Type exports for TypeScript
export type CreateClientInput = z.infer<typeof createClientSchema>["body"];
export type UpdateClientInput = z.infer<typeof updateClientSchema>["body"];
export type ClientSearchInput = z.infer<typeof clientSearchSchema>["query"];
export type ClientIdParams = z.infer<typeof clientIdParamsSchema>["params"];
