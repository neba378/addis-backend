export interface CreateNoteData {
  title: string;
  content: string;
  clientId: number;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
}
