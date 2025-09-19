import { z } from "zod";

// Folder creation validation schema
export const createFolderSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Folder name is required")
      .max(100, "Folder name must be less than 100 characters")
      .trim(),

    clientId: z
      .number({
        required_error: "Client ID is required",
        invalid_type_error: "Client ID must be a number",
      })
      .int("Client ID must be an integer")
      .positive("Client ID must be a positive number"),

    type: z.enum(["default", "custom"]).optional().default("custom"),
  }),
});

// Folder update validation schema
export const updateFolderSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Folder name is required")
      .max(100, "Folder name must be less than 100 characters")
      .trim(),
  }),
});

// Folder search validation schema
export const folderSearchSchema = z.object({
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
    sortBy: z.string().optional().default("name"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  }),
});

// Params validation schemas
export const folderIdParamsSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, "Folder ID is required")
      .regex(/^\d+$/, "Folder ID must be a number")
      .transform(Number),
  }),
});

export const clientIdParamsSchema = z.object({
  params: z.object({
    clientId: z
      .string()
      .min(1, "Client ID is required")
      .regex(/^\d+$/, "Client ID must be a number")
      .transform(Number),
  }),
});

// Type exports for TypeScript
export type CreateFolderInput = z.infer<typeof createFolderSchema>["body"];
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>["body"];
export type FolderSearchInput = z.infer<typeof folderSearchSchema>["query"];
export type FolderIdParams = z.infer<typeof folderIdParamsSchema>["params"];
export type ClientIdParams = z.infer<typeof clientIdParamsSchema>["params"];
