import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Like validate() but parses req.query instead of req.body.
 * Handles string→number coercions defined in the schema.
 *
 * Usage: router.get('/tasks', validateQuery(taskQuerySchema), controller.listTasks)
 */
export const validateQuery =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

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
        message: 'Invalid query parameters.',
        errors,
      });
      return;
    }

    // Replace req.query with parsed and coerced values
    req.query = result.data as Record<string, string>;
    next();
  };
