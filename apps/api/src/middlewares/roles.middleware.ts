import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/errors';

// Middleware para verificar que el usuario pertenece a una tienda
export function storeMiddleware(requiredRoles?: Role[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      // El storeId puede venir de params, body o query
      const storeId = req.params.storeId || req.body.storeId || req.query.storeId;

      if (!storeId) {
        throw new NotFoundError('Store ID is required');
      }

      // Buscar la membresía del usuario en esta tienda
      const member = await prisma.storeMember.findUnique({
        where: {
          storeId_userId: {
            storeId: storeId as string,
            userId: req.user.userId,
          },
        },
      });

      if (!member || !member.isActive) {
        throw new ForbiddenError('You do not have access to this store');
      }

      // Verificar roles si se especificaron
      if (requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.includes(member.role)) {
          throw new ForbiddenError('You do not have permission for this action');
        }
      }

      // Agregar info del miembro al request
      req.member = {
        id: member.id,
        role: member.role,
        storeId: member.storeId,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Middleware para verificar que es owner o admin
export const ownerOrAdminMiddleware = storeMiddleware([Role.OWNER, Role.ADMIN]);

// Middleware para verificar que es owner
export const ownerOnlyMiddleware = storeMiddleware([Role.OWNER]);

// Middleware para cualquier rol (solo verifica pertenencia)
export const memberMiddleware = storeMiddleware();
