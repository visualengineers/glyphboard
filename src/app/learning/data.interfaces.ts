export interface Progress {
  total: number;
  done: number;
}

export interface Document {
  id: string;
  text: string;
}

export interface Answer {
  documentId: string;
  questionId: string;
  answer: string;
}
