import { Note, Client, NoteFile } from "@prisma/client";

export interface CreateNoteData {
  title: string;
  content: string;
  clientId: string;
  files?: Express.Multer.File[];
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  files?: Express.Multer.File[];
}

export type NoteWithClient = Note & {
  client: Pick<Client, "id" | "fullName" | "caseNumber">;
  files?: NoteFile[];
};
