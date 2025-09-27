import { Folder, File, Client } from "@prisma/client";

export interface CreateFolderData {
  name: string;
  clientId: string;
  type?: "default" | "custom";
  description?: string | undefined;
}

export interface UpdateFolderData {
  name?: string | undefined;
  description?: string | undefined;
}

// Folder with files and client details
export type FolderWithFiles = Folder & {
  files: File[];
  client: Pick<Client, "id" | "fullName" | "caseNumber">;
};

// Folder with basic client details
export type FolderWithClient = Folder & {
  client: Pick<Client, "id" | "fullName" | "caseNumber">;
};

// Folder with file count (for listings)
export type FolderWithFileCount = Folder & {
  _count: {
    files: number;
  };
  client: Pick<Client, "id" | "fullName" | "caseNumber">;
};

// For folder listings with pagination
export type FolderListResponse = {
  data: FolderWithClient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
