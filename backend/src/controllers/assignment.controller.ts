import type { Request, Response } from 'express';
import { AssignmentModel } from '../models/Assignment';
import { getQueue } from '../queues/queue';
import { streamPaperAsPDF } from '../services/pdf.service';
import { generateQuestionPaper } from '../services/ai.service';
import { extractTextFromFile } from '../services/parser.service';
import { cacheGet, cacheSet } from '../utils/redis';
import type { CreateAssignmentDTO, ApiResponse, Assignment } from '../../../shared/types';
import { z } from 'zod';
import crypto from 'crypto';

// Validation schema
const CreateAssignmentSchema = z.object({
  subject: z.string().min(1).max(100).trim(),
  grade: z.string().min(1).max(50).trim(),
  dueDate: z.string().min(1),
  questionTypes: z
    .array(
      z.object({
        type: z.string().min(1),
        count: z.number().int().positive().max(50),
        marks: z.number().int().positive().max(20),
      })
    )
    .min(1)
    .max(8),
  additionalInstructions: z.string().max(500).optional(),
});

export async function createAssignment(req: Request, res: Response): Promise<void> {
  // Handle questionTypes coming as a JSON string (multipart form-data)
  if (typeof req.body.questionTypes === 'string') {
    try {
      req.body.questionTypes = JSON.parse(req.body.questionTypes);
    } catch {
      res.status(400).json({ success: false, error: 'Invalid questionTypes format' });
      return;
    }
  }

  const parse = CreateAssignmentSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({
      success: false,
      error: parse.error.errors.map((e) => e.message).join(', '),
    } as ApiResponse<never>);
    return;
  }

  const dto = parse.data as unknown as CreateAssignmentDTO;

  // If a file was uploaded, extract text and prepend to instructions
  let extractedText: string | null = null;
  let finalInstructions = dto.additionalInstructions || '';

  if ((req as any).file) {
    const file = (req as any).file as Express.Multer.File;
    try {
      extractedText = await extractTextFromFile(file.buffer, file.mimetype, file.originalname);
      const fileContext = `\n\n[Extracted from uploaded file "${file.originalname}"]:\n${extractedText.slice(0, 3000)}`;
      finalInstructions = (finalInstructions + fileContext).trim();
    } catch (err: any) {
      console.warn('⚠️ File extraction failed (continuing without it):', err.message);
    }
  }

  // Create assignment record
  const assignment = new AssignmentModel({
    subject: dto.subject,
    grade: dto.grade,
    dueDate: dto.dueDate,
    questionTypes: dto.questionTypes,
    additionalInstructions: finalInstructions,
    fileName: (req as any).file?.originalname || null,
    extractedText,
    status: 'pending',
  });

  await assignment.save();

  // Enqueue generation job
  const queue = getQueue();
  const job = await queue.add('generate-paper', {
    assignmentId: assignment._id.toString(),
    subject: dto.subject,
    grade: dto.grade,
    questionTypes: dto.questionTypes,
    additionalInstructions: finalInstructions || undefined,
  });

  assignment.jobId = job.id || '';
  await assignment.save();

  res.status(201).json({
    success: true,
    data: {
      assignmentId: assignment._id.toString(),
      jobId: job.id,
      status: 'pending',
    },
  } as ApiResponse<{ assignmentId: string; jobId: string | undefined; status: string }>);
}

export async function getAssignments(_req: Request, res: Response): Promise<void> {
  const assignments = await AssignmentModel.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json({ success: true, data: assignments } as ApiResponse<typeof assignments>);
}

export async function getAssignment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const assignment = await AssignmentModel.findById(id).lean();

  if (!assignment) {
    res.status(404).json({ success: false, error: 'Assignment not found' });
    return;
  }

  res.json({ success: true, data: assignment } as ApiResponse<typeof assignment>);
}

export async function deleteAssignment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await AssignmentModel.findByIdAndDelete(id);

  if (!result) {
    res.status(404).json({ success: false, error: 'Assignment not found' });
    return;
  }

  res.json({ success: true, data: { deleted: true } });
}

export async function regenerateAssignment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const assignment = await AssignmentModel.findById(id);

  if (!assignment) {
    res.status(404).json({ success: false, error: 'Assignment not found' });
    return;
  }

  // Reset status
  assignment.status = 'pending';
  assignment.generatedPaper = undefined;
  await assignment.save();

  // Enqueue new job
  const queue = getQueue();
  const job = await queue.add('generate-paper', {
    assignmentId: id,
    subject: assignment.subject,
    grade: assignment.grade,
    questionTypes: assignment.questionTypes,
    additionalInstructions: assignment.additionalInstructions,
  });

  assignment.jobId = job.id || '';
  await assignment.save();

  res.json({
    success: true,
    data: { assignmentId: id, jobId: job.id, status: 'pending' },
  });
}

export async function downloadPDF(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const assignment = await AssignmentModel.findById(id).lean();

  if (!assignment) {
    res.status(404).json({ success: false, error: 'Assignment not found' });
    return;
  }

  if (assignment.status !== 'completed' || !assignment.generatedPaper) {
    res.status(400).json({ success: false, error: 'Paper not yet generated' });
    return;
  }

  streamPaperAsPDF(assignment.generatedPaper as any, res);
}
