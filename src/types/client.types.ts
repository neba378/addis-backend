import { Folder, Note } from "@prisma/client";
export interface CreateClientData {
  fullName: string;
  caseNumber: string;
  phoneNumber: string;
  appointmentDate?: Date | string | null;
  assignedLawyer?: string;
  court?: string;
  createdBy: string;
  status?: string;
}

export interface UpdateClientData {
  fullName?: string;
  caseNumber?: string;
  phoneNumber?: string;
  appointmentDate?: Date | string | null;
  assignedLawyer?: string;
  court?: string;
  status?: string;
}

export interface ClientFilters {
  status?: string;
  caseNumber?: string;
  lawyer?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface ClientWithRelations {
  id: number;
  fullName: string;
  caseNumber: string;
  status: string;
  phoneNumber: string;
  appointmentDate: Date | null;
  assignedLawyer: string | null;
  court: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  folders: Folder[];
  notes: Note[];
}
