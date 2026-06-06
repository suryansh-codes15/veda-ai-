// shared/types.ts — shared between frontend and backend

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionType =
  | 'Multiple Choice Questions'
  | 'Short Answer Questions'
  | 'Long Answer Questions'
  | 'Diagram/Graph-Based Questions'
  | 'Numerical Problems'
  | 'True/False Questions'
  | 'Fill in the Blanks'
  | 'Match the Following';

export interface QuestionTypeConfig {
  type: QuestionType;
  count: number;
  marks: number;
}

export interface CreateAssignmentDTO {
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  fileUrl?: string;
}

export interface Question {
  id: string;
  question: string;
  difficulty: Difficulty;
  marks: number;
  answer: string;
  options?: string[]; // for MCQ
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  schoolName: string;
  subject: string;
  grade: string;
  timeAllowed: string;
  maxMarks: number;
  sections: Section[];
}

export interface Assignment {
  _id: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedPaper?: GeneratedPaper;
  jobId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobProgressEvent {
  assignmentId: string;
  progress: number;
  stage: string;
}

export interface JobCompleteEvent {
  assignmentId: string;
  paper: GeneratedPaper;
}

export interface JobFailedEvent {
  assignmentId: string;
  error: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
