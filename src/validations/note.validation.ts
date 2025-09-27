import { z } from "zod";

// Add this to your existing note validation schemas

// Global search validation schema
export const globalSearchSchema = z.object({
  query: z.object({
    q: z
      .string()
      .min(1, "Search query is required")
      .max(100, "Search query must be less than 100 characters")
      .trim(),
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

export type GlobalSearchInput = z.infer<typeof globalSearchSchema>["query"];
// Note creation validation schema
export const createNoteSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters")
      .trim(),

    content: z
      .string()
      .min(1, "Content is required")
      .max(5000, "Content must be less than 5000 characters")
      .trim(),

    clientId: z.string({
      required_error: "Client ID is required",
      invalid_type_error: "Client ID must be a string",
    }),
  }),
});

// Note update validation schema
export const updateNoteSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters")
      .trim()
      .optional(),

    content: z
      .string()
      .min(1, "Content is required")
      .max(5000, "Content must be less than 5000 characters")
      .trim()
      .optional(),
  }),
});

// Note search validation schema
export const noteSearchSchema = z.object({
  query: z.object({
    q: z
      .string()
      .min(1, "Search query is required")
      .max(100, "Search query must be less than 100 characters")
      .trim(),
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

// Pagination validation schema
export const paginationSchema = z.object({
  query: z.object({
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
export const noteIdParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Note ID is required"),
  }),
});

export const clientIdParamsSchema = z.object({
  params: z.object({
    clientId: z.string().min(1, "Client ID is required"),
  }),
});

// Type exports for TypeScript
export type CreateNoteInput = z.infer<typeof createNoteSchema>["body"];
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>["body"];
export type NoteSearchInput = z.infer<typeof noteSearchSchema>["query"];
export type PaginationInput = z.infer<typeof paginationSchema>["query"];
export type NoteIdParams = z.infer<typeof noteIdParamsSchema>["params"];
export type ClientIdParams = z.infer<typeof clientIdParamsSchema>["params"];
