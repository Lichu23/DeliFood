import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';

/**
 * CSRF Protection Middleware
 *
 * Since this API uses JWT (stateless), traditional session-based CSRF tokens
 * don't apply. Instead, we use:
 *
 * 1. Origin/Referer header validation for state-changing requests
 * 2. Double-submit cookie pattern (optional, for clients that need it)
 */

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a random CSRF token
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Get allowed origins from environment
 */
function getAllowedOrigins(): string[] {
  return [
    ...env.corsOrigins,
    env.appUrl,
    env.apiUrl,
  ].filter(Boolean);
}

/**
 * Check if the request origin is allowed
 */
function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;

  const allowedOrigins = getAllowedOrigins();

  // Check exact match
  if (allowedOrigins.includes(origin)) return true;

  // In development, allow localhost on any port
  if (env.isDev && origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
    return true;
  }

  return false;
}

/**
 * Validate Origin/Referer header for state-changing requests
 * This prevents CSRF attacks from malicious websites
 */
export function originValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Only check state-changing methods
  const stateMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!stateMethods.includes(req.method)) {
    return next();
  }

  // Skip validation for certain paths (e.g., webhooks)
  const skipPaths = ['/api/webhooks'];
  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Get origin from headers
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // If no origin header, check referer
  let requestOrigin = origin;
  if (!requestOrigin && referer) {
    try {
      const refererUrl = new URL(referer);
      requestOrigin = refererUrl.origin;
    } catch {
      // Invalid referer URL
    }
  }

  // In development, be more lenient
  if (env.isDev) {
    // Allow requests without origin (e.g., Postman, curl)
    if (!requestOrigin) {
      return next();
    }
  }

  // In production, require and validate origin
  if (env.isProd) {
    // Allow requests without origin from server-side or mobile apps
    // These will have valid JWT tokens
    if (!requestOrigin && req.headers.authorization) {
      return next();
    }

    // Validate origin if present
    if (requestOrigin && !isOriginAllowed(requestOrigin)) {
      console.warn(`[CSRF] Blocked request from origin: ${requestOrigin}`);
      res.status(403).json({
        success: false,
        message: 'Invalid request origin',
      });
      return;
    }
  }

  next();
}

/**
 * Middleware to set CSRF token cookie
 * Use this for endpoints that need to provide a CSRF token to clients
 */
export function setCsrfTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Check if client already has a token
  const existingToken = req.cookies?.[CSRF_COOKIE_NAME];

  if (!existingToken) {
    const token = generateCsrfToken();

    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Must be readable by JavaScript
      secure: env.isProd,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });
  }

  next();
}

/**
 * Middleware to validate CSRF token (double-submit cookie pattern)
 * The client must send the token in both:
 * - Cookie: XSRF-TOKEN
 * - Header: X-CSRF-Token
 */
export function validateCsrfTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Only check state-changing methods
  const stateMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!stateMethods.includes(req.method)) {
    return next();
  }

  // Get tokens
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;

  // If using CSRF tokens (cookie is set), validate
  if (cookieToken) {
    if (!headerToken || cookieToken !== headerToken) {
      res.status(403).json({
        success: false,
        message: 'Invalid CSRF token',
      });
      return;
    }
  }

  next();
}

/**
 * Combined CSRF protection middleware
 * - Validates origin for all state-changing requests
 * - Optionally validates CSRF tokens if cookie is present
 */
export function csrfProtectionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // First, validate origin
  originValidationMiddleware(req, res, (err) => {
    if (err) return next(err);
    if (res.headersSent) return; // Response already sent (blocked)

    // Then, validate CSRF token if present
    validateCsrfTokenMiddleware(req, res, next);
  });
}

/**
 * Endpoint to get a CSRF token
 * GET /api/csrf-token
 */
export function getCsrfTokenHandler(
  _req: Request,
  res: Response
): void {
  const token = generateCsrfToken();

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: env.isProd,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.json({
    success: true,
    data: { token },
  });
}
