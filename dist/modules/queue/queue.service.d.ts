import { JobType, PipelineJob, LogLevel } from '@prisma/client';
export declare function createIngestionJob(sourceId: string, correlationId?: string): Promise<PipelineJob>;
export declare function createNormalizeJob(rawRecordId: string, correlationId?: string): Promise<PipelineJob>;
export declare function createEnrichJob(normalizedRecordId: string, correlationId?: string): Promise<PipelineJob>;
export declare function addJobLog(jobId: string, message: string, level?: LogLevel): Promise<void>;
export declare function processJob(job: PipelineJob, handler: (payload: Record<string, unknown>) => Promise<void>): Promise<void>;
export declare function getJobWithLogs(jobId: string): Promise<{
    job: PipelineJob | null;
    logs: Array<{
        message: string;
        level: string;
        timestamp: Date;
    }>;
}>;
export declare function getPendingJobs(type: JobType): Promise<PipelineJob[]>;
export declare function reprocessJob(jobId: string): Promise<PipelineJob>;
export declare function reprocessDeadLetter(jobId: string): Promise<PipelineJob>;
//# sourceMappingURL=queue.service.d.ts.map