import { Note, Client } from "@prisma/client";

export interface CreateNoteData {
  title: string;
  content: string;
  clientId: number;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
}

export type NoteWithClient = Note & {
  client: Pick<Client, "id" | "fullName" | "caseNumber">;
};
