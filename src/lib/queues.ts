// Basic queue configuration and job types for Next.js app
// This replaces missing BullMQ/pg-boss queue implementations

export const QUEUE_NAMES = {
  CARD_GENERATION: 'card_generation',
  IMAGE_EDITING: 'image_editing',
  BULK_PROCESSING: 'bulk_processing',
} as const;

// Basic job data interfaces
export interface CardGenerationJobData {
  userId: string;
  cardData: Record<string, unknown>;
  packId?: string;
}

export interface ImageEditJobData {
  userId: string;
  imagePath: string;
  edits: Record<string, unknown>;
}

export interface ImageEditJobResult {
  success: boolean;
  editedImageUrl?: string;
  error?: string;
}

export interface CardGenerationResult {
  success: boolean;
  cardId?: number;
  error?: string;
}

export interface BulkProcessingJobData {
  userId: string;
  items: Record<string, unknown>[];
  operation: string;
}

export interface JobStatus {
  id: string;
  state: string;
  progress: number;
  data: Record<string, unknown> | null;
  opts: Record<string, unknown>;
  updatedAt?: Date;
}

export interface JobStatusUpdate {
  state?: string;
  progress?: number;
  data?: Record<string, unknown>;
  opts?: Record<string, unknown>;
}

// Simple job status tracking (in-memory for demo)
const jobStatuses = new Map<string, JobStatus>();

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const status = jobStatuses.get(jobId);
  if (!status) {
    return {
      id: jobId,
      state: 'unknown',
      progress: 0,
      data: null,
      opts: {},
    };
  }
  return status;
}

export async function updateJobStatus(
  jobId: string,
  data: JobStatusUpdate,
): Promise<void> {
  jobStatuses.set(jobId, {
    id: jobId,
    ...data,
    updatedAt: new Date(),
  } as JobStatus);
}
