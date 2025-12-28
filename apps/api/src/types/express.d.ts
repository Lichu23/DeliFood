import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
      member?: {
        id: string;
        role: Role;
        storeId: string;
      };
    }
  }
}

export {};
