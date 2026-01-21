# Security Documentation

## Overview

This document outlines the security measures implemented in the DeliFood API, based on OWASP Top 10 (2021) guidelines.

## Quick Commands

```bash
# Run full security audit (npm audit + OWASP checks)
npm run security:audit

# Run only OWASP security checks
npm run security:check

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## OWASP Top 10 (2021) Compliance

### A01:2021 – Broken Access Control ✅

| Control | Status | Implementation |
|---------|--------|----------------|
| Role-based access | ✅ | `roles.middleware.ts` - OWNER, ADMIN, CASHIER, DELIVERY |
| Authentication | ✅ | `auth.middleware.ts` - JWT validation |
| CORS | ✅ | `security.ts` - Configured allowed origins |

### A02:2021 – Cryptographic Failures ✅

| Control | Status | Implementation |
|---------|--------|----------------|
| Password hashing | ✅ | bcrypt with auto-generated salt |
| JWT secrets | ✅ | Required env variable, validated at startup |
| HTTPS enforcement | ✅ | HSTS headers in production |

### A03:2021 – Injection ✅

| Control | Status | Implementation |
|---------|--------|----------------|
| SQL injection | ✅ | Prisma ORM (parameterized queries) |
| XSS prevention | ✅ | `sanitize.middleware.ts` - HTML entity escaping |
| Input validation | ✅ | Zod schemas for all inputs |

### A04:2021 – Insecure Design ✅

| Control | Status | Implementation |
|---------|--------|----------------|
| Rate limiting | ✅ | `rateLimit.middleware.ts` - Per endpoint limits |
| Account lockout | ✅ | `account-lockout.ts` - 10 attempts, 15min lockout |
| Password strength | ✅ | `password-validation.ts` - 8+ chars, mixed case, numbers |

### A05:2021 – Security Misconfiguration ✅

| Control | Status | Implementation |
|---------|--------|----------------|
| Security headers | ✅ | Helmet.js with full configuration |
| X-Powered-By | ✅ | Hidden |
| Env validation | ✅ | Required vars checked at startup |
| Error handling | ✅ | Stack traces hidden in production |

### A06:2021 – Vulnerable Components ✅

| Control | Status | Implementation |
|---------|--------|----------------|
| Dependency audit | ✅ | `npm audit` - 0 vulnerabilities |
| Regular updates | 📝 | Run `npm outdated` periodically |

### A07:2021 – Identification and Authentication Failures ✅

| Control | Status | Implementation |
|---------|--------|----------------|
| JWT expiration | ✅ | 7 days (configurable) |
| Login rate limit | ✅ | 5 attempts per 15 minutes |
| Secure hashing | ✅ | bcrypt (adaptive algorithm) |

### A08:2021 – Software and Data Integrity Failures ✅

| Control | Status | Implementation |
|---------|--------|----------------|
| CSRF protection | ✅ | Origin validation + token support |
| CSP headers | ✅ | Content Security Policy configured |

### A09:2021 – Security Logging and Monitoring ✅

| Control | Status | Implementation |
|---------|--------|----------------|
| Request logging | ✅ | Morgan (dev/combined modes) |
| Security events | ✅ | Failed login attempts, suspicious patterns logged |

### A10:2021 – Server-Side Request Forgery ✅

| Control | Status | Implementation |
|---------|--------|----------------|
| External APIs | ✅ | Only trusted services (OpenRouteService, Cloudinary) |

---

## Security Features

### 1. Authentication & Authorization

#### JWT Authentication
- Tokens expire in 7 days (configurable via `JWT_EXPIRES_IN`)
- Required header: `Authorization: Bearer <token>`
- Payload includes: `userId`, `email`, `iat`, `exp`

#### Role-Based Access Control
```
OWNER   → Full access, cannot be removed
ADMIN   → All except delete store
CASHIER → Manage orders only
DELIVERY → View assigned orders, update status
```

#### Account Lockout
- **Max attempts**: 10 failed logins
- **Lockout duration**: 15 minutes
- **Tracking**: By IP + email combination
- **Reset**: Automatic after successful login

### 2. Input Validation & Sanitization

#### Zod Validation
All request inputs are validated using Zod schemas:
- Body, query params, and URL params
- Type coercion and transformation
- Custom error messages

#### XSS Prevention
The `sanitizeMiddleware` processes all requests:
- Escapes HTML entities: `<`, `>`, `"`, `'`, `/`, `` ` ``, `=`
- Removes null bytes
- Detects and logs suspicious patterns

**Excluded fields** (to preserve special characters):
- `password`, `currentPassword`, `newPassword`, `confirmPassword`

### 3. Rate Limiting

| Endpoint Type | Limit (Production) | Window |
|--------------|-------------------|--------|
| General API | 200 requests | 15 min |
| Auth routes | 10 requests | 15 min |
| Login | 5 requests | 15 min |
| Password change | 3 requests | 1 hour |
| Orders | 5 requests | 1 min |
| Uploads | 10 requests | 1 min |
| Public endpoints | 60 requests | 1 min |
| Sensitive ops | 10 requests | 1 hour |

### 4. Security Headers (Helmet.js)

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | Configured | Control resource loading |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | Legacy XSS filter |
| Strict-Transport-Security | max-age=31536000 | Force HTTPS |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer |
| X-DNS-Prefetch-Control | off | Disable DNS prefetch |
| X-Permitted-Cross-Domain-Policies | none | Block cross-domain |

### 5. CORS Configuration

```typescript
{
  origin: [configured origins],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', ...],
  maxAge: 86400 // 24 hours preflight cache
}
```

### 6. CSRF Protection

- **Origin validation**: Checks Origin/Referer headers for state-changing requests
- **Token endpoint**: `GET /api/csrf-token`
- **Double-submit cookie**: Optional for clients that need it

### 7. Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- Cannot be in top 100 common passwords list

---

## SQL Injection Prevention

### Prisma ORM Protection

This API uses Prisma ORM which provides automatic SQL injection protection:

1. **Parameterized Queries**: All queries are automatically parameterized
2. **Type Safety**: TypeScript ensures type-safe queries
3. **No Raw SQL**: The codebase does not use `$queryRaw` or `$executeRaw`

### Best Practices

```typescript
// ✅ GOOD - Prisma handles parameterization
const user = await prisma.user.findUnique({
  where: { email: userInput }
});

// ❌ BAD - Never use raw queries with user input
const user = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;
```

---

## Environment Variables

### Required (Validated at Startup)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |

### Recommended for Production

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to `production` |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `REDIS_URL` | Redis connection for caching |

---

## Security Checklist for Deployment

### Before Going Live

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ random characters)
- [ ] Configure `CORS_ORIGINS` with actual domain
- [ ] Enable HTTPS on load balancer/proxy
- [ ] Run `npm audit` and fix any vulnerabilities
- [ ] Run `npm run security:check` - all checks pass
- [ ] Review and rotate any exposed credentials
- [ ] Set up monitoring/alerting for security events

### Ongoing Maintenance

- [ ] Run `npm audit` weekly
- [ ] Update dependencies monthly
- [ ] Review access logs for suspicious activity
- [ ] Rotate JWT secret periodically
- [ ] Review and update CORS origins as needed

---

## 2FA/MFA Support (Future)

The foundation for 2FA is prepared but not yet fully implemented. When ready:

1. Install TOTP library: `npm install otplib`
2. Add `twoFactorSecret` field to User model
3. Create enable/disable 2FA endpoints
4. Add 2FA verification to login flow

---

## Reporting Security Issues

If you discover a security vulnerability, please report it to:
- Email: security@delifood.app (example)
- Do NOT create public GitHub issues for security vulnerabilities
