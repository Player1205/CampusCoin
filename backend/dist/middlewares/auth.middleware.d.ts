import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const protect: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const restrictTo: (...roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map