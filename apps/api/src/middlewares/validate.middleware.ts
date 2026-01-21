import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors';

export function validate(schema: z.ZodType) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      console.log('🔍 Validating request:', {
        body: req.body,
        params: req.params,
        query: req.query,
      });

      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      console.log('✅ Validation passed');
      next();
    } catch (error) {
      console.log('❌ Validation error:', error);

      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};

        // Zod v4 uses 'issues' instead of 'errors'
        const issues = error.issues || (error as any).errors || [];
        issues.forEach((issue: z.ZodIssue) => {
          const path = issue.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        });

        next(new ValidationError(errors));
      } else {
        console.error('⚠️ Non-Zod validation error:', error);
        next(error);
      }
    }
  };
}
