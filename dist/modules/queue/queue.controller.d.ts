import { Request, Response, NextFunction } from 'express';
export declare class QueueController {
    getJobs(req: Request, res: Response, next: NextFunction): Promise<void>;
    getJobLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
    reprocess(req: Request, res: Response, next: NextFunction): Promise<void>;
    reprocessDeadLetter(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const queueController: QueueController;
//# sourceMappingURL=queue.controller.d.ts.map