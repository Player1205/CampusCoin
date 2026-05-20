import { Request, Response, NextFunction } from 'express';
import { RegisterInput, LoginInput } from '../validations/auth.schema';
import { AuthenticatedRequest } from '../types';
export declare const register: (req: Request<Record<string, never>, unknown, RegisterInput>, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request<Record<string, never>, unknown, LoginInput>, res: Response, next: NextFunction) => Promise<void>;
export declare const logout: (_req: Request, res: Response) => void;
export declare const getMe: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map