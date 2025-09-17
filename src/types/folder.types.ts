export interface CreateFolderData {
  name: string;
  clientId: number;
  type?: "default" | "custom";
}

export interface UpdateFolderData {
  name?: string;
}

export interface FolderWithFiles {
  id: number;
  name: string;
  type: string;
  clientId: number;
  createdAt: Date;
  updatedAt: Date;
  files: File[];
}
