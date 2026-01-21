/**
 * Account Lockout System
 *
 * Tracks failed login attempts and locks accounts after too many failures.
 * Uses in-memory storage (can be upgraded to Redis for distributed systems).
 */

interface LoginAttempt {
  count: number;
  lastAttempt: Date;
  lockedUntil: Date | null;
}

// Configuration
const LOCKOUT_CONFIG = {
  maxAttempts: 10,          // Lock after 10 failed attempts
  lockoutDuration: 15 * 60 * 1000,  // 15 minutes lockout
  attemptWindow: 15 * 60 * 1000,    // Reset attempts after 15 minutes of no activity
};

// In-memory store for login attempts
// In production, this should be stored in Redis for distributed systems
const loginAttempts = new Map<string, LoginAttempt>();

/**
 * Get the key for tracking attempts (by email or IP+email)
 */
function getAttemptKey(email: string, ip?: string): string {
  return ip ? `${ip}:${email.toLowerCase()}` : email.toLowerCase();
}

/**
 * Check if an account is currently locked
 */
export function isAccountLocked(email: string, ip?: string): boolean {
  const key = getAttemptKey(email, ip);
  const attempt = loginAttempts.get(key);

  if (!attempt) return false;

  // Check if locked and lock is still active
  if (attempt.lockedUntil && attempt.lockedUntil > new Date()) {
    return true;
  }

  // Lock has expired, reset it
  if (attempt.lockedUntil && attempt.lockedUntil <= new Date()) {
    loginAttempts.delete(key);
    return false;
  }

  return false;
}

/**
 * Get the remaining lockout time in seconds
 */
export function getLockoutRemainingSeconds(email: string, ip?: string): number {
  const key = getAttemptKey(email, ip);
  const attempt = loginAttempts.get(key);

  if (!attempt?.lockedUntil) return 0;

  const remaining = attempt.lockedUntil.getTime() - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Record a failed login attempt
 * Returns true if account is now locked
 */
export function recordFailedAttempt(email: string, ip?: string): boolean {
  const key = getAttemptKey(email, ip);
  const now = new Date();
  let attempt = loginAttempts.get(key);

  if (!attempt) {
    // First failed attempt
    attempt = {
      count: 1,
      lastAttempt: now,
      lockedUntil: null,
    };
  } else {
    // Check if we should reset the counter (attempt window expired)
    const timeSinceLastAttempt = now.getTime() - attempt.lastAttempt.getTime();
    if (timeSinceLastAttempt > LOCKOUT_CONFIG.attemptWindow) {
      attempt.count = 1;
    } else {
      attempt.count += 1;
    }
    attempt.lastAttempt = now;

    // Check if we should lock the account
    if (attempt.count >= LOCKOUT_CONFIG.maxAttempts) {
      attempt.lockedUntil = new Date(now.getTime() + LOCKOUT_CONFIG.lockoutDuration);
    }
  }

  loginAttempts.set(key, attempt);

  return attempt.lockedUntil !== null;
}

/**
 * Record a successful login (clears failed attempts)
 */
export function recordSuccessfulLogin(email: string, ip?: string): void {
  const key = getAttemptKey(email, ip);
  loginAttempts.delete(key);
}

/**
 * Get the number of remaining attempts before lockout
 */
export function getRemainingAttempts(email: string, ip?: string): number {
  const key = getAttemptKey(email, ip);
  const attempt = loginAttempts.get(key);

  if (!attempt) return LOCKOUT_CONFIG.maxAttempts;

  return Math.max(0, LOCKOUT_CONFIG.maxAttempts - attempt.count);
}

/**
 * Manually unlock an account (admin function)
 */
export function unlockAccount(email: string, ip?: string): void {
  const key = getAttemptKey(email, ip);
  loginAttempts.delete(key);
}

/**
 * Clear all lockouts (for testing/maintenance)
 */
export function clearAllLockouts(): void {
  loginAttempts.clear();
}

/**
 * Get lockout status for an account
 */
export function getLockoutStatus(email: string, ip?: string): {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutRemainingSeconds: number;
} {
  return {
    isLocked: isAccountLocked(email, ip),
    remainingAttempts: getRemainingAttempts(email, ip),
    lockoutRemainingSeconds: getLockoutRemainingSeconds(email, ip),
  };
}

// Cleanup expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = new Date();
  for (const [key, attempt] of loginAttempts.entries()) {
    // Remove if locked and lock expired
    if (attempt.lockedUntil && attempt.lockedUntil <= now) {
      loginAttempts.delete(key);
      continue;
    }
    // Remove if no activity for longer than attempt window
    const timeSinceLastAttempt = now.getTime() - attempt.lastAttempt.getTime();
    if (timeSinceLastAttempt > LOCKOUT_CONFIG.attemptWindow * 2) {
      loginAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);
