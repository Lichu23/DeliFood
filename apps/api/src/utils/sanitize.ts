/**
 * Input Sanitization Utilities
 * Prevents XSS attacks by sanitizing user input
 */

/**
 * HTML entities to escape
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove potentially dangerous HTML tags and scripts
 */
export function stripHtmlTags(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '');
}

/**
 * Remove null bytes and other dangerous characters
 */
export function removeNullBytes(str: string): string {
  return str.replace(/\0/g, '');
}

/**
 * Sanitize a string value
 */
export function sanitizeString(value: string): string {
  if (typeof value !== 'string') return value;

  let sanitized = value;

  // Remove null bytes
  sanitized = removeNullBytes(sanitized);

  // Trim whitespace
  sanitized = sanitized.trim();

  // Escape HTML entities
  sanitized = escapeHtml(sanitized);

  return sanitized;
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T>(obj: T, options: SanitizeOptions = {}): T {
  const {
    skipFields = [],
    sanitizeHtml = true,
    maxDepth = 10
  } = options;

  function sanitize(value: unknown, depth: number): unknown {
    // Prevent infinite recursion
    if (depth > maxDepth) return value;

    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return sanitizeHtml ? sanitizeString(value) : removeNullBytes(value.trim());
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitize(item, depth + 1));
    }

    if (typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(value)) {
        // Skip specified fields (like passwords)
        if (skipFields.includes(key)) {
          sanitized[key] = val;
        } else {
          sanitized[key] = sanitize(val, depth + 1);
        }
      }

      return sanitized;
    }

    return value;
  }

  return sanitize(obj, 0) as T;
}

export interface SanitizeOptions {
  /** Fields to skip sanitization (e.g., passwords) */
  skipFields?: string[];
  /** Whether to sanitize HTML (default: true) */
  sanitizeHtml?: boolean;
  /** Maximum recursion depth (default: 10) */
  maxDepth?: number;
}

/**
 * Fields that should not be HTML sanitized
 * (but still get null bytes removed)
 */
export const SKIP_HTML_SANITIZE_FIELDS = [
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
];

/**
 * Validate that a string doesn't contain SQL injection patterns
 * Note: Prisma handles SQL injection through parameterized queries,
 * but this adds an extra layer of protection for logging/alerts
 */
export function detectSqlInjection(value: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
    /(--)|(\/\*)|(\*\/)/,
    /(;|\||`)/,
    /(\bOR\b|\bAND\b)\s*\d+\s*=\s*\d+/i,
    /'\s*(OR|AND)\s*'?\d/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(value));
}

/**
 * Check for common XSS attack patterns
 */
export function detectXssPatterns(value: string): boolean {
  const xssPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:\s*text\/html/i,
    /expression\s*\(/i,
    /vbscript:/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(value));
}
