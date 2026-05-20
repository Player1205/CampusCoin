import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export declare const validateQuery: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validateQuery.middleware.d.ts.map