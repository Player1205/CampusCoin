import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const expressInterest: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listMyChats: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getChatById: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const sendMessage: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const setAgreedPrice: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=chat.controller.d.ts.map