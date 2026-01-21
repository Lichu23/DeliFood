import { CorsOptions } from 'cors';
import { HelmetOptions } from 'helmet';
import { env } from './env';

/**
 * CORS Configuration
 * Controls which origins can access the API
 */
export const corsConfig: CorsOptions = {
  // Allowed origins (from environment)
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = env.corsOrigins;

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, allow localhost on any port
    if (env.isDev && origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
  ],

  // Exposed headers (accessible to the client)
  exposedHeaders: [
    'X-Total-Count',
    'X-Page',
    'X-Per-Page',
    'X-Total-Pages',
  ],

  // Preflight cache duration (24 hours)
  maxAge: 86400,

  // Pass the CORS preflight response to the next handler
  preflightContinue: false,

  // Respond with 204 for OPTIONS requests
  optionsSuccessStatus: 204,
};

/**
 * Helmet.js Configuration
 * Sets various HTTP headers for security
 */
export const helmetConfig: HelmetOptions = {
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https://res.cloudinary.com', // Cloudinary images
      ],
      fontSrc: ["'self'", 'data:'],
      connectSrc: [
        "'self'",
        env.apiUrl,
        'wss:', // WebSocket connections
        'ws:',
      ],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: env.isProd ? [] : null,
    },
    reportOnly: false,
  },

  // X-DNS-Prefetch-Control
  dnsPrefetchControl: {
    allow: false,
  },

  // X-Frame-Options - Prevent clickjacking
  frameguard: {
    action: 'deny',
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // Strict-Transport-Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // X-Content-Type-Options - Prevent MIME sniffing
  noSniff: true,

  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },

  // Referrer-Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // X-XSS-Protection (legacy, but still useful for older browsers)
  xssFilter: true,

  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: false, // Disabled to allow Cloudinary images

  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: {
    policy: 'same-origin',
  },

  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: {
    policy: 'cross-origin', // Allow cross-origin for API
  },

  // Origin-Agent-Cluster
  originAgentCluster: true,
};

/**
 * Development Helmet Configuration
 * Less restrictive for local development
 */
export const helmetConfigDev: HelmetOptions = {
  ...helmetConfig,
  contentSecurityPolicy: false, // Disable CSP in development
  hsts: false, // Disable HSTS in development
};

/**
 * Get appropriate Helmet config based on environment
 */
export function getHelmetConfig(): HelmetOptions {
  return env.isProd ? helmetConfig : helmetConfigDev;
}

/**
 * Security-related constants
 */
export const securityConstants = {
  // Maximum request body size
  maxBodySize: '10mb',

  // Maximum JSON payload size
  maxJsonSize: '10mb',

  // Maximum URL-encoded payload size
  maxUrlencodedSize: '10mb',

  // Request timeout (30 seconds)
  requestTimeout: 30000,

  // Maximum parameter pollution limit
  maxParameterLimit: 100,
};
