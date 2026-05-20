import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const listTasks: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const cancelTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const applyToTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const withdrawApplication: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const assignDoer: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const submitTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const completeTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyTasks: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=swap.controller.d.ts.map