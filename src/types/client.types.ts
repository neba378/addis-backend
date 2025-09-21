import { Client, Folder, Note, File } from "@prisma/client";

export interface CreateClientData {
  fullName: string;
  phoneNumber: string;
  appointmentDate?: Date | string | null | undefined;
  assignedLawyer?: string | null | undefined;
  court?: string | null | undefined;
  createdBy: string;
  status?: string | undefined;
  caseNumber?: string | null | undefined; // Optional for initial creation
}

export interface UpdateClientData {
  fullName?: string | undefined;
  phoneNumber?: string | undefined;
  appointmentDate?: Date | string | null | undefined;
  assignedLawyer?: string | undefined | null;
  court?: string | null | undefined;
  status?: string | undefined;
  caseNumber?: string | null | undefined; // Can be added/updated later
}

export interface ClientFilters {
  status?: string | undefined;
  caseNumber?: string | undefined;
  lawyer?: string | undefined;
  startDate?: Date | undefined;
  search?: string | undefined;
}

export type ClientWithRelations = Client & {
  folders: Folder[];
  notes: Note[];
};

export type ClientWithFolders = Client & {
  folders: Folder[];
};

// For client listings
export type ClientListItem = Pick<
  Client,
  "id" | "fullName" | "caseNumber" | "status" | "assignedLawyer" | "createdAt"
> & {
  folderCount: number;
  noteCount: number;
  fileCount: number;
};
