import { Client, Folder, File, Note } from "@prisma/client";

export type ClientEntity = Client;
export type FolderEntity = Folder;
export type FileEntity = File;
export type NoteEntity = Note;

export type ClientWithRelations = Client & {
  folders: Folder[];
  notes: Note[];
};

export type FolderWithFiles = Folder & {
  files: File[];
  client: Client;
};

export type FileWithFolder = File & {
  folder: Folder;
};

export type NoteWithClient = Note & {
  client: Client;
};
