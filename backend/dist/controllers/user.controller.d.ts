import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const updateMe: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMe: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const sendVerificationOtp: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyEmail: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map