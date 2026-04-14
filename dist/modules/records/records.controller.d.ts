import { Request, Response, NextFunction } from 'express';
export declare class RecordsController {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEnriched(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const recordsController: RecordsController;
//# sourceMappingURL=records.controller.d.ts.map