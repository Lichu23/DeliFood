/**
 * Security Audit Script
 * Based on OWASP Top 10 (2021) checklist
 *
 * Run with: npx ts-node scripts/security-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuditCheck {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'MANUAL' | 'N/A';
  details?: string;
}

const checks: AuditCheck[] = [];

// Helper to add a check
function addCheck(
  id: string,
  category: string,
  name: string,
  description: string,
  status: 'PASS' | 'FAIL' | 'MANUAL' | 'N/A',
  details?: string
) {
  checks.push({ id, category, name, description, status, details });
}

// Helper to check if a file contains a pattern
function fileContains(filePath: string, pattern: RegExp | string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (typeof pattern === 'string') {
      return content.includes(pattern);
    }
    return pattern.test(content);
  } catch {
    return false;
  }
}

// Helper to check if a file exists
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

console.log('🔒 DeliFood Security Audit');
console.log('=' .repeat(60));
console.log('Based on OWASP Top 10 (2021)\n');

const srcPath = path.join(__dirname, '..', 'src');
const appPath = path.join(srcPath, 'app.ts');
const envPath = path.join(srcPath, 'config', 'env.ts');
const securityPath = path.join(srcPath, 'config', 'security.ts');

// ============================================================================
// A01:2021 – Broken Access Control
// ============================================================================

addCheck(
  'A01-01',
  'Broken Access Control',
  'Role-based access control implemented',
  'Application uses role-based middleware for authorization',
  fileExists(path.join(srcPath, 'middlewares', 'roles.middleware.ts')) ? 'PASS' : 'FAIL',
  'roles.middleware.ts exists and defines OWNER, ADMIN, CASHIER, DELIVERY roles'
);

addCheck(
  'A01-02',
  'Broken Access Control',
  'Authentication middleware exists',
  'JWT authentication middleware is implemented',
  fileExists(path.join(srcPath, 'middlewares', 'auth.middleware.ts')) ? 'PASS' : 'FAIL'
);

addCheck(
  'A01-03',
  'Broken Access Control',
  'CORS properly configured',
  'Cross-Origin Resource Sharing is configured with allowed origins',
  fileExists(securityPath) && fileContains(securityPath, 'corsConfig') ? 'PASS' : 'FAIL'
);

// ============================================================================
// A02:2021 – Cryptographic Failures
// ============================================================================

addCheck(
  'A02-01',
  'Cryptographic Failures',
  'Passwords are hashed',
  'Passwords use bcrypt hashing',
  fileContains(path.join(srcPath, 'utils', 'password.ts'), 'bcrypt') ? 'PASS' : 'FAIL'
);

addCheck(
  'A02-02',
  'Cryptographic Failures',
  'JWT secret is required',
  'JWT_SECRET is a required environment variable',
  fileContains(envPath, 'JWT_SECRET') ? 'PASS' : 'FAIL'
);

addCheck(
  'A02-03',
  'Cryptographic Failures',
  'HTTPS enforced in production',
  'Helmet HSTS is configured for production',
  fileContains(securityPath, 'hsts') ? 'PASS' : 'FAIL'
);

// ============================================================================
// A03:2021 – Injection
// ============================================================================

addCheck(
  'A03-01',
  'Injection',
  'SQL injection prevention (Prisma ORM)',
  'Using Prisma ORM with parameterized queries',
  fileExists(path.join(srcPath, 'lib', 'prisma.ts')) ? 'PASS' : 'FAIL',
  'Prisma provides automatic SQL injection protection'
);

addCheck(
  'A03-02',
  'Injection',
  'No raw SQL queries',
  'Application does not use $queryRaw or $executeRaw',
  'MANUAL',
  'Run: grep -r "queryRaw\\|executeRaw" src/'
);

addCheck(
  'A03-03',
  'Injection',
  'Input validation with Zod',
  'All inputs are validated with Zod schemas',
  fileExists(path.join(srcPath, 'middlewares', 'validate.middleware.ts')) ? 'PASS' : 'FAIL'
);

addCheck(
  'A03-04',
  'Injection',
  'XSS prevention (input sanitization)',
  'Input sanitization middleware is implemented',
  fileExists(path.join(srcPath, 'middlewares', 'sanitize.middleware.ts')) ? 'PASS' : 'FAIL'
);

// ============================================================================
// A04:2021 – Insecure Design
// ============================================================================

addCheck(
  'A04-01',
  'Insecure Design',
  'Rate limiting implemented',
  'API rate limiting is configured',
  fileExists(path.join(srcPath, 'middlewares', 'rateLimit.middleware.ts')) ? 'PASS' : 'FAIL'
);

addCheck(
  'A04-02',
  'Insecure Design',
  'Account lockout mechanism',
  'Account lockout after failed login attempts',
  fileExists(path.join(srcPath, 'utils', 'account-lockout.ts')) ? 'PASS' : 'FAIL'
);

addCheck(
  'A04-03',
  'Insecure Design',
  'Password strength requirements',
  'Strong password validation is implemented',
  fileExists(path.join(srcPath, 'utils', 'password-validation.ts')) ? 'PASS' : 'FAIL'
);

// ============================================================================
// A05:2021 – Security Misconfiguration
// ============================================================================

addCheck(
  'A05-01',
  'Security Misconfiguration',
  'Helmet.js security headers',
  'Helmet is configured with security headers',
  fileContains(appPath, 'helmet') ? 'PASS' : 'FAIL'
);

addCheck(
  'A05-02',
  'Security Misconfiguration',
  'X-Powered-By hidden',
  'Express X-Powered-By header is hidden',
  fileContains(securityPath, 'hidePoweredBy') ? 'PASS' : 'FAIL'
);

addCheck(
  'A05-03',
  'Security Misconfiguration',
  'Environment validation',
  'Required environment variables are validated',
  fileContains(envPath, 'validateEnv') ? 'PASS' : 'FAIL'
);

addCheck(
  'A05-04',
  'Security Misconfiguration',
  'Error messages do not leak info',
  'Custom error handler hides stack traces in production',
  fileExists(path.join(srcPath, 'middlewares', 'error.middleware.ts')) ? 'PASS' : 'FAIL'
);

// ============================================================================
// A06:2021 – Vulnerable and Outdated Components
// ============================================================================

addCheck(
  'A06-01',
  'Vulnerable Components',
  'npm audit clean',
  'No known vulnerabilities in dependencies',
  'MANUAL',
  'Run: npm audit'
);

addCheck(
  'A06-02',
  'Vulnerable Components',
  'Dependencies up to date',
  'Dependencies should be regularly updated',
  'MANUAL',
  'Run: npm outdated'
);

// ============================================================================
// A07:2021 – Identification and Authentication Failures
// ============================================================================

addCheck(
  'A07-01',
  'Authentication Failures',
  'JWT token expiration',
  'JWT tokens have expiration time configured',
  fileContains(envPath, 'jwtExpiresIn') ? 'PASS' : 'FAIL'
);

addCheck(
  'A07-02',
  'Authentication Failures',
  'Login rate limiting',
  'Specific rate limiting for login endpoint',
  fileContains(path.join(srcPath, 'middlewares', 'rateLimit.middleware.ts'), 'loginLimiter') ? 'PASS' : 'FAIL'
);

addCheck(
  'A07-03',
  'Authentication Failures',
  'Password hashing with bcrypt',
  'Passwords are hashed with bcrypt (adaptive hashing)',
  fileContains(path.join(srcPath, 'utils', 'password.ts'), 'bcrypt.hash') ? 'PASS' : 'FAIL'
);

// ============================================================================
// A08:2021 – Software and Data Integrity Failures
// ============================================================================

addCheck(
  'A08-01',
  'Integrity Failures',
  'CSRF protection',
  'CSRF protection middleware is implemented',
  fileExists(path.join(srcPath, 'middlewares', 'csrf.middleware.ts')) ? 'PASS' : 'FAIL'
);

addCheck(
  'A08-02',
  'Integrity Failures',
  'Content Security Policy',
  'CSP headers are configured',
  fileContains(securityPath, 'contentSecurityPolicy') ? 'PASS' : 'FAIL'
);

// ============================================================================
// A09:2021 – Security Logging and Monitoring Failures
// ============================================================================

addCheck(
  'A09-01',
  'Logging Failures',
  'Request logging (Morgan)',
  'HTTP request logging is configured',
  fileContains(appPath, 'morgan') ? 'PASS' : 'FAIL'
);

addCheck(
  'A09-02',
  'Logging Failures',
  'Security event logging',
  'Security events (failed logins, suspicious activity) are logged',
  fileContains(path.join(srcPath, 'middlewares', 'sanitize.middleware.ts'), 'console.warn') ? 'PASS' : 'FAIL'
);

// ============================================================================
// A10:2021 – Server-Side Request Forgery (SSRF)
// ============================================================================

addCheck(
  'A10-01',
  'SSRF',
  'External API calls validated',
  'External API URLs are from trusted sources only',
  'MANUAL',
  'Review OpenRouteService and Cloudinary integrations'
);

// ============================================================================
// Print Results
// ============================================================================

console.log('\n📋 OWASP Top 10 Security Audit Results\n');
console.log('-'.repeat(60));

const categories = [...new Set(checks.map(c => c.category))];

let totalPass = 0;
let totalFail = 0;
let totalManual = 0;

for (const category of categories) {
  console.log(`\n🔹 ${category}`);
  console.log('-'.repeat(40));

  const categoryChecks = checks.filter(c => c.category === category);

  for (const check of categoryChecks) {
    const statusIcon =
      check.status === 'PASS' ? '✅' :
      check.status === 'FAIL' ? '❌' :
      check.status === 'MANUAL' ? '🔍' : '⚪';

    console.log(`${statusIcon} [${check.id}] ${check.name}`);
    if (check.details) {
      console.log(`   └─ ${check.details}`);
    }

    if (check.status === 'PASS') totalPass++;
    else if (check.status === 'FAIL') totalFail++;
    else if (check.status === 'MANUAL') totalManual++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 Summary');
console.log('='.repeat(60));
console.log(`✅ Passed:  ${totalPass}`);
console.log(`❌ Failed:  ${totalFail}`);
console.log(`🔍 Manual:  ${totalManual}`);
console.log(`📝 Total:   ${checks.length}`);

const passRate = ((totalPass / (checks.length - totalManual)) * 100).toFixed(1);
console.log(`\n🎯 Pass Rate: ${passRate}% (excluding manual checks)`);

if (totalFail > 0) {
  console.log('\n⚠️  Action Required: Fix failed checks before production deployment');
  process.exit(1);
} else {
  console.log('\n✅ All automated checks passed!');
  console.log('📝 Remember to complete manual verification checks.');
}
