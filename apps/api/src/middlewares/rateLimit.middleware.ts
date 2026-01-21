import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isProd ? 100 : 1000, // 100 requests per 15 min in prod, 1000 in dev
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.isProd, // Skip in development
});

// Stricter rate limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isProd ? 10 : 100, // 10 login attempts per 15 min in prod
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.isProd,
});

// Rate limit for order creation (per IP)
export const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.isProd ? 5 : 50, // 5 orders per minute in prod
  message: {
    success: false,
    message: 'Too many orders, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.isProd,
});

// Rate limit for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.isProd ? 10 : 100, // 10 uploads per minute in prod
  message: {
    success: false,
    message: 'Too many uploads, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.isProd,
});
