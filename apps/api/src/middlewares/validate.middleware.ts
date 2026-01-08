import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export function validate(schema: AnyZodObject) {
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

      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};

        // Check if errors array exists
        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((err) => {
            const path = err.path.join('.');
            if (!errors[path]) {
              errors[path] = [];
            }
            errors[path].push(err.message);
          });
        } else {
          console.error('⚠️ ZodError without errors array:', error);
        }

        next(new ValidationError(errors));
      } else {
        console.error('⚠️ Non-Zod validation error:', error);
        next(error);
      }
    }
  };
}
