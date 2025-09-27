import { z } from "zod";

// File creation validation schema
export const createFileSchema = z.object({
  body: z.object({
    fileName: z
      .string()
      .min(1, "File name is required")
      .max(255, "File name must be less than 255 characters")
      .trim(),

    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .trim()
      .optional(),

    metaTags: z
      .array(z.string().max(50, "Meta tag must be less than 50 characters"))
      .optional(),
    folderId: z.string({
      required_error: "Folder ID is required",
      invalid_type_error: "Folder ID must be a string",
    }),
  }),
});

// File update validation schema
export const updateFileSchema = z.object({
  body: z.object({
    fileName: z
      .string()
      .min(1, "File name is required")
      .max(255, "File name must be less than 255 characters")
      .trim()
      .optional(),

    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .trim()
      .optional()
      .nullable(),
    metaTags: z
      .array(z.string().max(50, "Meta tag must be less than 50 characters"))
      .nullable(),
  }),
});

// File upload validation schema
export const fileUploadSchema = z.object({
  params: z.object({
    folderId: z
      .string()
      .min(1, "Folder ID is required")
      .regex(/^\d+$/, "Folder ID must be a number")
      .transform(Number),
  }),
});

// File search validation schema
export const fileSearchSchema = z.object({
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
    sortBy: z.string().optional().default("uploadedAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

// Params validation schemas
export const fileIdParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "File ID is required"),
  }),
});

export const folderIdParamsSchema = z.object({
  params: z.object({
    folderId: z.string().min(1, "Folder ID is required"),
  }),
});

export const clientIdParamsSchema = z.object({
  params: z.object({
    clientId: z.string().min(1, "Client ID is required"),
  }),
});

// Type exports for TypeScript
export type CreateFileInput = z.infer<typeof createFileSchema>["body"];
export type UpdateFileInput = z.infer<typeof updateFileSchema>["body"];
export type FileUploadParams = z.infer<typeof fileUploadSchema>["params"];
export type FileSearchInput = z.infer<typeof fileSearchSchema>["query"];
export type FileIdParams = z.infer<typeof fileIdParamsSchema>["params"];
export type FolderIdParams = z.infer<typeof folderIdParamsSchema>["params"];
export type ClientIdParams = z.infer<typeof clientIdParamsSchema>["params"];
