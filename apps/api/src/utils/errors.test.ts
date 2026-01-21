import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from './errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an error with message and status code', () => {
      const error = new AppError('Test error', 500);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should have a stack trace', () => {
      const error = new AppError('Test error', 500);
      expect(error.stack).toBeDefined();
    });
  });

  describe('BadRequestError', () => {
    it('should have status code 400', () => {
      const error = new BadRequestError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should use default message when none provided', () => {
      const error = new BadRequestError();

      expect(error.message).toBe('Bad request');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('UnauthorizedError', () => {
    it('should have status code 401', () => {
      const error = new UnauthorizedError('Invalid token');

      expect(error.message).toBe('Invalid token');
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
    });

    it('should use default message when none provided', () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should have status code 403', () => {
      const error = new ForbiddenError('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.isOperational).toBe(true);
    });

    it('should use default message when none provided', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('should have status code 404', () => {
      const error = new NotFoundError('Resource not found');

      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it('should use default message when none provided', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ConflictError', () => {
    it('should have status code 409', () => {
      const error = new ConflictError('Resource already exists');

      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
      expect(error.isOperational).toBe(true);
    });

    it('should use default message when none provided', () => {
      const error = new ConflictError();

      expect(error.message).toBe('Conflict');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('ValidationError', () => {
    it('should have status code 422', () => {
      const errors = {
        email: ['Invalid email format'],
        password: ['Password too short', 'Password must contain a number'],
      };
      const error = new ValidationError(errors);

      expect(error.message).toBe('Validation error');
      expect(error.statusCode).toBe(422);
      expect(error.isOperational).toBe(true);
      expect(error.errors).toEqual(errors);
    });

    it('should handle empty errors object', () => {
      const error = new ValidationError({});

      expect(error.message).toBe('Validation error');
      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual({});
    });
  });
});
