import 'dotenv/config';
import mongoose from 'mongoose';
import { Worker, Job } from 'bullmq';
import { Server as SocketServer } from 'socket.io';
import { cacheGet, cacheSet } from '../utils/redis';
import { generateQuestionPaper } from '../services/ai.service';
import { AssignmentModel } from '../models/Assignment';
import { QUEUE_NAME, type GenerationJobData } from './queue';
import type { GeneratedPaper, QuestionTypeConfig } from '../../../shared/types';
import crypto from 'crypto';

// Global io reference — injected from app.ts when running inline
// When running as standalone worker, this is null and we use a minimal emit
let _io: SocketServer | null = null;

export function setSocketServer(io: SocketServer): void {
  _io = io;
}

function emit(event: string, data: { assignmentId: string; [key: string]: unknown }): void {
  if (_io) {
    // Emit to the assignment-specific room so only subscribed clients receive it
    _io.to(`assignment:${data.assignmentId}`).emit(event, data);
  }
}

function buildCacheKey(
  subject: string,
  grade: string,
  questionTypes: QuestionTypeConfig[],
  additionalInstructions?: string
): string {
  const raw = JSON.stringify({ subject, grade, questionTypes, additionalInstructions });
  return 'paper:' + crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null as null,
  enableReadyCheck: false,
};

export function createWorker(): Worker<GenerationJobData> {
  const worker = new Worker<GenerationJobData>(
    QUEUE_NAME,
    async (job: Job<GenerationJobData>) => {
      const { assignmentId, subject, grade, questionTypes, additionalInstructions } = job.data;

      // Cast the questionTypes — they may arrive as plain strings from the queue
      const typedQuestionTypes = questionTypes as QuestionTypeConfig[];

      console.log(`🔄 Processing job ${job.id} for assignment ${assignmentId}`);

      // Stage 1 — Mark processing
      await AssignmentModel.updateOne({ _id: assignmentId }, { status: 'processing' });
      emit('job:progress', { assignmentId, progress: 10, stage: 'Initializing AI engine...' });
      await job.updateProgress(10);

      // Stage 2 — Check cache
      emit('job:progress', { assignmentId, progress: 20, stage: 'Checking cache...' });
      await job.updateProgress(20);

      const cacheKey = buildCacheKey(subject, grade, typedQuestionTypes, additionalInstructions);
      const cached = await cacheGet<GeneratedPaper>(cacheKey);

      let paper: GeneratedPaper;

      if (cached) {
        console.log(`✅ Cache hit for ${cacheKey}`);
        emit('job:progress', { assignmentId, progress: 70, stage: 'Loaded from cache...' });
        await job.updateProgress(70);
        paper = cached;
      } else {
        // Stage 3 — Call Groq AI
        emit('job:progress', { assignmentId, progress: 35, stage: 'Calling Groq AI...' });
        await job.updateProgress(35);

        emit('job:progress', { assignmentId, progress: 50, stage: 'Generating questions...' });
        await job.updateProgress(50);

        paper = await generateQuestionPaper(subject, grade, typedQuestionTypes, additionalInstructions);

        emit('job:progress', { assignmentId, progress: 70, stage: 'Structuring sections...' });
        await job.updateProgress(70);

        // Cache the result
        await cacheSet(cacheKey, paper);
      }

      // Stage 4 — Store in MongoDB
      emit('job:progress', { assignmentId, progress: 85, stage: 'Saving to database...' });
      await job.updateProgress(85);

      await AssignmentModel.updateOne(
        { _id: assignmentId },
        { status: 'completed', generatedPaper: paper }
      );

      emit('job:progress', { assignmentId, progress: 100, stage: 'Complete!' });
      await job.updateProgress(100);

      // Emit completion event
      emit('job:complete', { assignmentId, paper });

      console.log(`✅ Job ${job.id} completed for assignment ${assignmentId}`);
      return { assignmentId, paper };
    },
    {
      connection: redisConnection,
      concurrency: 3,
    }
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const { assignmentId } = job.data;
    console.error(`❌ Job ${job.id} failed:`, err.message);

    await AssignmentModel.updateOne({ _id: assignmentId }, { status: 'failed' }).catch(() => {});

    emit('job:failed', { assignmentId, error: err.message });
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  console.log('🚀 BullMQ Worker started');
  return worker;
}

// Standalone worker entrypoint
if (require.main === module) {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai')
    .then(() => {
      console.log('✅ MongoDB connected (worker)');
      createWorker();
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err);
      process.exit(1);
    });
}
