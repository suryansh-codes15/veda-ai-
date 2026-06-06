import mongoose, { Schema, Document } from 'mongoose';
import type { Assignment, QuestionTypeConfig, GeneratedPaper } from '../../../shared/types';

export interface IAssignment extends Omit<Assignment, '_id'>, Document {
  fileName?: string | null;
  extractedText?: string | null;
}

const QuestionTypeConfigSchema = new Schema<QuestionTypeConfig>({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
});

const QuestionSchema = new Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  marks: { type: Number, required: true },
  answer: { type: String, required: true },
  options: [{ type: String }],
});

const SectionSchema = new Schema({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
});

const GeneratedPaperSchema = new Schema<GeneratedPaper>({
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  grade: { type: String, required: true },
  timeAllowed: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  sections: [SectionSchema],
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    subject: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    questionTypes: [QuestionTypeConfigSchema],
    additionalInstructions: { type: String, default: '' },
    fileName: { type: String, default: null },
    extractedText: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    generatedPaper: { type: GeneratedPaperSchema, default: null },
    jobId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
AssignmentSchema.index({ status: 1, createdAt: -1 });
AssignmentSchema.index({ jobId: 1 });

export const AssignmentModel = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
