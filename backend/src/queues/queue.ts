import { Queue } from 'bullmq';

export const QUEUE_NAME = 'assignment-generation';

export interface GenerationJobData {
  assignmentId: string;
  subject: string;
  grade: string;
  questionTypes: Array<{ type: string; count: number; marks: number }>;
  additionalInstructions?: string;
}

let queueInstance: Queue<GenerationJobData> | null = null;

export function getQueue(): Queue<GenerationJobData> {
  if (!queueInstance) {
    queueInstance = new Queue<GenerationJobData>(QUEUE_NAME, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }
  return queueInstance;
}
