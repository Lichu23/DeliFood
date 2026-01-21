import { Request, Response, NextFunction } from 'express';
import {
  sanitizeObject,
  detectXssPatterns,
  detectSqlInjection,
  SKIP_HTML_SANITIZE_FIELDS,
} from '../utils/sanitize';
import { env } from '../config/env';

/**
 * Middleware to sanitize all incoming request data
 * Prevents XSS attacks by escaping HTML entities
 */
export function sanitizeMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      // Detect potential attacks (logging only, for monitoring)
      if (env.isProd) {
        checkForAttackPatterns(req.body, req.path);
      }

      req.body = sanitizeObject(req.body, {
        skipFields: SKIP_HTML_SANITIZE_FIELDS,
      });
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query, {
        skipFields: [],
      });
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params, {
        skipFields: [],
      });
    }

    next();
  } catch (error) {
    // If sanitization fails, continue without sanitization
    // but log the error for monitoring
    console.error('Sanitization error:', error);
    next();
  }
}

/**
 * Check for attack patterns and log for monitoring
 * This doesn't block requests, just logs suspicious activity
 */
function checkForAttackPatterns(
  obj: Record<string, unknown>,
  path: string
): void {
  const checkValue = (value: unknown, key: string): void => {
    if (typeof value === 'string') {
      if (detectXssPatterns(value)) {
        console.warn(`[SECURITY] Potential XSS attempt detected`, {
          path,
          field: key,
          timestamp: new Date().toISOString(),
        });
      }

      if (detectSqlInjection(value)) {
        console.warn(`[SECURITY] Potential SQL injection attempt detected`, {
          path,
          field: key,
          timestamp: new Date().toISOString(),
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
        checkValue(v, `${key}.${k}`);
      });
    }
  };

  Object.entries(obj).forEach(([key, value]) => {
    checkValue(value, key);
  });
}

/**
 * Middleware to block requests with obviously malicious content
 * Use this for high-security endpoints
 */
export function strictSanitizeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const checkForMaliciousContent = (obj: unknown): boolean => {
    if (typeof obj === 'string') {
      return detectXssPatterns(obj);
    }

    if (Array.isArray(obj)) {
      return obj.some(checkForMaliciousContent);
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkForMaliciousContent);
    }

    return false;
  };

  // Check body
  if (req.body && checkForMaliciousContent(req.body)) {
    res.status(400).json({
      success: false,
      message: 'Invalid request content',
    });
    return;
  }

  // Check query params
  if (req.query && checkForMaliciousContent(req.query)) {
    res.status(400).json({
      success: false,
      message: 'Invalid request content',
    });
    return;
  }

  // Apply standard sanitization and continue
  sanitizeMiddleware(req, res, next);
}
