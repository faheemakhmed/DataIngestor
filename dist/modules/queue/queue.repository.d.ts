import { JobType, JobStatus, PipelineJob, Prisma } from '@prisma/client';
export interface CreateJobDto {
    type: JobType;
    payload: Prisma.InputJsonValue;
    scheduledAt?: Date;
    correlationId?: string;
}
export interface JobRepository {
    create(data: CreateJobDto): Promise<PipelineJob>;
    findById(id: string): Promise<PipelineJob | null>;
    findPending(type: JobType, limit: number): Promise<PipelineJob[]>;
    updateStatus(id: string, status: JobStatus, error?: string): Promise<PipelineJob>;
    incrementRetry(id: string): Promise<PipelineJob>;
    markDeadLetter(id: string, error: string): Promise<PipelineJob>;
}
export declare class PrismaJobRepository implements JobRepository {
    create(data: CreateJobDto): Promise<PipelineJob>;
    findById(id: string): Promise<PipelineJob | null>;
    findPending(type: JobType, limit: number): Promise<PipelineJob[]>;
    updateStatus(id: string, status: JobStatus, error?: string): Promise<PipelineJob>;
    incrementRetry(id: string): Promise<PipelineJob>;
    markDeadLetter(id: string, error: string): Promise<PipelineJob>;
}
export declare const jobRepository: PrismaJobRepository;
//# sourceMappingURL=queue.repository.d.ts.map