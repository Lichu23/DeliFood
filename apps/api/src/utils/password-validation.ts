import { z } from 'zod';

/**
 * Password strength requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Optional for better UX
};

/**
 * Password validation messages (Spanish)
 */
export const PASSWORD_MESSAGES = {
  minLength: `La contraseña debe tener al menos ${PASSWORD_REQUIREMENTS.minLength} caracteres`,
  maxLength: `La contraseña no puede exceder ${PASSWORD_REQUIREMENTS.maxLength} caracteres`,
  uppercase: 'La contraseña debe contener al menos una letra mayúscula',
  lowercase: 'La contraseña debe contener al menos una letra minúscula',
  number: 'La contraseña debe contener al menos un número',
  specialChar: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*)',
  common: 'Esta contraseña es muy común. Por favor, elija otra',
  weak: 'La contraseña es muy débil',
};

/**
 * Common passwords to reject (top 100 most common)
 */
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
  'bailey', 'passw0rd', 'shadow', '123123', '654321',
  'superman', 'qazwsx', 'michael', 'football', 'password1',
  'password123', 'welcome', 'welcome1', 'admin', 'login',
  'princess', 'qwerty123', '123456789', '12345', '1234',
  'password!', 'contraseña', 'clave', 'admin123', 'user',
  'guest', 'test', 'test123', 'root', 'toor',
]);

/**
 * Check if password is in common passwords list
 */
export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

/**
 * Check password strength and return detailed results
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    maxLength: password.length <= PASSWORD_REQUIREMENTS.maxLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    notCommon: !isCommonPassword(password),
  };

  const errors: string[] = [];

  if (!checks.minLength) errors.push(PASSWORD_MESSAGES.minLength);
  if (!checks.maxLength) errors.push(PASSWORD_MESSAGES.maxLength);
  if (PASSWORD_REQUIREMENTS.requireUppercase && !checks.hasUppercase) {
    errors.push(PASSWORD_MESSAGES.uppercase);
  }
  if (PASSWORD_REQUIREMENTS.requireLowercase && !checks.hasLowercase) {
    errors.push(PASSWORD_MESSAGES.lowercase);
  }
  if (PASSWORD_REQUIREMENTS.requireNumbers && !checks.hasNumber) {
    errors.push(PASSWORD_MESSAGES.number);
  }
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !checks.hasSpecialChar) {
    errors.push(PASSWORD_MESSAGES.specialChar);
  }
  if (!checks.notCommon) errors.push(PASSWORD_MESSAGES.common);

  // Calculate strength score (0-100)
  let score = 0;
  if (checks.minLength) score += 20;
  if (checks.hasUppercase) score += 15;
  if (checks.hasLowercase) score += 15;
  if (checks.hasNumber) score += 15;
  if (checks.hasSpecialChar) score += 15;
  if (checks.notCommon) score += 10;
  if (password.length >= 12) score += 10;

  const strength: PasswordStrength =
    score >= 80 ? 'strong' :
    score >= 60 ? 'medium' :
    score >= 40 ? 'weak' : 'very-weak';

  return {
    isValid: errors.length === 0,
    strength,
    score,
    checks,
    errors,
  };
}

/**
 * Zod schema for strong password validation
 */
export const strongPasswordSchema = z
  .string()
  .min(PASSWORD_REQUIREMENTS.minLength, PASSWORD_MESSAGES.minLength)
  .max(PASSWORD_REQUIREMENTS.maxLength, PASSWORD_MESSAGES.maxLength)
  .refine((password) => /[A-Z]/.test(password), {
    message: PASSWORD_MESSAGES.uppercase,
  })
  .refine((password) => /[a-z]/.test(password), {
    message: PASSWORD_MESSAGES.lowercase,
  })
  .refine((password) => /[0-9]/.test(password), {
    message: PASSWORD_MESSAGES.number,
  })
  .refine((password) => !isCommonPassword(password), {
    message: PASSWORD_MESSAGES.common,
  });

/**
 * Zod schema for password (basic - login only)
 */
export const passwordSchema = z
  .string()
  .min(1, 'Password is required');

export interface PasswordStrengthResult {
  isValid: boolean;
  strength: PasswordStrength;
  score: number;
  checks: {
    minLength: boolean;
    maxLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    notCommon: boolean;
  };
  errors: string[];
}

export type PasswordStrength = 'very-weak' | 'weak' | 'medium' | 'strong';
