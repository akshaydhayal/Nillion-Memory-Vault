export interface Note {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteRequest {
  noteId: string;
  title: string;
  content: string;
  tags?: string[];
}

export interface SearchRequest {
  query: string;
}

export interface QuestionRequest {
  question: string;
}

