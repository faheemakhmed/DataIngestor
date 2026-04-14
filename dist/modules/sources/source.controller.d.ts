import { Request, Response, NextFunction } from 'express';
export declare class SourceController {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    sync(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCheckpoint(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const sourceController: SourceController;
//# sourceMappingURL=source.controller.d.ts.map