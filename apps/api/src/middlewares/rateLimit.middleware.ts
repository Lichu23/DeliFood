import rateLimit, { Options } from 'express-rate-limit';
import { Response } from 'express';
import { env } from '../config/env';

/**
 * Rate limit configuration by endpoint type
 */
const RATE_LIMITS = {
  // General API - relaxed limits
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: { prod: 200, dev: 2000 },
  },
  // Authentication - strict limits to prevent brute force
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: { prod: 10, dev: 100 },
  },
  // Login specifically - very strict
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: { prod: 5, dev: 50 },
  },
  // Password change/reset - strict
  password: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: { prod: 3, dev: 30 },
  },
  // Order creation - moderate limits
  orders: {
    windowMs: 60 * 1000, // 1 minute
    max: { prod: 5, dev: 50 },
  },
  // File uploads - moderate limits
  uploads: {
    windowMs: 60 * 1000, // 1 minute
    max: { prod: 10, dev: 100 },
  },
  // Public endpoints - relaxed
  public: {
    windowMs: 60 * 1000, // 1 minute
    max: { prod: 60, dev: 600 },
  },
  // Sensitive operations - strict
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: { prod: 10, dev: 100 },
  },
};

/**
 * Create a rate limiter with common options
 */
function createLimiter(
  config: { windowMs: number; max: { prod: number; dev: number } },
  message: string
): ReturnType<typeof rateLimit> {
  const options: Partial<Options> = {
    windowMs: config.windowMs,
    max: env.isProd ? config.max.prod : config.max.dev,
    message: {
      success: false,
      message,
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    // Skip rate limiting in development if needed
    skip: () => false, // Always apply for testing
    // Use default key generator (handles IPv6 properly)
    // Handler when limit is exceeded
    handler: (_req, res: Response) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(config.windowMs / 1000),
      });
    },
    // Disable validation warnings for custom implementations
    validate: { xForwardedForHeader: false },
  };

  return rateLimit(options);
}

/**
 * General API rate limit
 * Applied to all /api routes
 */
export const apiLimiter = createLimiter(
  RATE_LIMITS.api,
  'Too many requests, please try again later.'
);

/**
 * Authentication rate limit
 * Applied to /api/auth/* routes
 */
export const authLimiter = createLimiter(
  RATE_LIMITS.auth,
  'Too many authentication attempts, please try again later.'
);

/**
 * Login rate limit - stricter
 * Applied specifically to /api/auth/login
 */
export const loginLimiter = createLimiter(
  RATE_LIMITS.login,
  'Too many login attempts. Please try again in 15 minutes.'
);

/**
 * Password operations rate limit
 * Applied to password change/reset endpoints
 */
export const passwordLimiter = createLimiter(
  RATE_LIMITS.password,
  'Too many password change attempts. Please try again in 1 hour.'
);

/**
 * Order creation rate limit
 * Applied to order creation endpoints
 */
export const orderLimiter = createLimiter(
  RATE_LIMITS.orders,
  'Too many orders placed. Please wait before placing another order.'
);

/**
 * File upload rate limit
 * Applied to upload endpoints
 */
export const uploadLimiter = createLimiter(
  RATE_LIMITS.uploads,
  'Too many uploads. Please try again later.'
);

/**
 * Public endpoints rate limit
 * Applied to public store/product viewing
 */
export const publicLimiter = createLimiter(
  RATE_LIMITS.public,
  'Too many requests. Please slow down.'
);

/**
 * Sensitive operations rate limit
 * Applied to delete operations, role changes, etc.
 */
export const sensitiveLimiter = createLimiter(
  RATE_LIMITS.sensitive,
  'Too many sensitive operations. Please try again later.'
);

/**
 * Create a custom rate limiter for specific needs
 */
export function createCustomLimiter(
  windowMs: number,
  maxRequests: number,
  message: string
): ReturnType<typeof rateLimit> {
  return createLimiter(
    { windowMs, max: { prod: maxRequests, dev: maxRequests * 10 } },
    message
  );
}
