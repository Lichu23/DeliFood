# DeliFood API - Backend Context

## Tech Stack
- Express.js + TypeScript
- Prisma + PostgreSQL
- JWT Authentication
- Zod v4 Validation
- Cloudinary (images)
- OpenRouteService (ETA)

## Project Structure
```
src/
├── config/env.ts
├── lib/
│   ├── prisma.ts
│   ├── cloudinary.ts
│   └── openroute.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── roles.middleware.ts
│   ├── validate.middleware.ts
│   └── error.middleware.ts
├── modules/
│   ├── auth/
│   ├── stores/
│   ├── invitations/
│   ├── categories/
│   ├── products/
│   ├── uploads/
│   ├── delivery-zones/
│   ├── delivery-slots/
│   ├── blocked-dates/
│   └── orders/
├── utils/
│   ├── errors.ts
│   ├── jwt.ts
│   ├── password.ts
│   └── slug.ts
└── types/
```

## Module Pattern
Each module has:
- `*.schema.ts` - Zod validations
- `*.service.ts` - Business logic
- `*.routes.ts` - Express routes

## Response Format
```typescript
// Success
res.json({ success: true, data: result });

// Error
throw new BadRequestError('Message');
```

## Custom Errors
- BadRequestError (400)
- UnauthorizedError (401)
- ForbiddenError (403)
- NotFoundError (404)
- ConflictError (409)

## Middlewares
- `authMiddleware` - Requires valid JWT
- `memberMiddleware` - Requires store membership
- `ownerOrAdminMiddleware` - Requires OWNER or ADMIN role
- `ownerOnlyMiddleware` - Requires OWNER role
- `validate(schema)` - Validates with Zod

## Commands
```bash
npm run dev          # Development
npm run build        # Production build
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB
npm run db:studio    # Open Prisma Studio
```
