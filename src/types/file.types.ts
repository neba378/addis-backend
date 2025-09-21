import { File, Folder, Client } from "@prisma/client";

export interface CreateFileData {
  fileName: string;
  description?: string | undefined;
  filePath: string;
  fileSize: number;
  mimeType: string;
  folderId: number;
}

export interface UpdateFileData {
  fileName?: string;
  description?: string | null;
}

export type FileWithFolder = File & {
  folder: Folder & {
    client: Pick<Client, "id" | "fullName" | "caseNumber">;
  };
};

export interface FileUploadResult {
  originalname: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}
