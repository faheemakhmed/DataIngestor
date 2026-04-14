import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function generateToken(userId: string, email: string): string;
//# sourceMappingURL=auth.middleware.d.ts.map