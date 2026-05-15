import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Generic Zod body validation middleware factory.
 * Usage: router.post('/tasks', validate(createTaskSchema), controller.createTask)
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = (result.error as ZodError).errors.reduce<Record<string, string>>(
        (acc, issue) => {
          const key = issue.path.join('.');
          acc[key] = issue.message;
          return acc;
        },
        {}
      );

      res.status(422).json({
        status: 'fail',
        message: 'Validation failed. Please check your input.',
        errors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
