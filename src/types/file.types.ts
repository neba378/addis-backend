export interface CreateFileData {
  fileName: string;
  description?: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  folderId: number;
}

export interface UpdateFileData {
  fileName?: string;
  description?: string;
}

export interface FileWithFolder {
  id: number;
  fileName: string;
  description: string | null;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  folderId: number;
  uploadedAt: Date;
  updatedAt: Date;
  folder: {
    id: number;
    name: string;
    client: {
      id: number;
      fullName: string;
      caseNumber: string;
    };
  };
}

export interface FileUploadResult {
  originalname: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}
