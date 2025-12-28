import { Router, Request, Response, NextFunction } from 'express';
import { storesService } from './stores.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  memberMiddleware,
  ownerOrAdminMiddleware,
  ownerOnlyMiddleware,
} from '../../middlewares/roles.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  updateStoreSchema,
  updateStoreSettingsSchema,
  removeMemberSchema,
} from './stores.schema';

const router = Router();

/**
 * GET /api/stores/:slug/public
 * Obtiene información pública de una tienda por slug
 */
router.get(
  '/stores/:slug/public',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await storesService.getBySlug(req.params.slug);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/stores/:storeId
 * Obtiene una tienda por ID (requiere ser miembro)
 */
router.get(
  '/stores/:storeId',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await storesService.getById(req.params.storeId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/stores/:storeId
 * Actualiza una tienda (solo owner o admin)
 */
router.patch(
  '/stores/:storeId',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(updateStoreSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await storesService.update(req.params.storeId, req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/stores/:storeId/settings
 * Actualiza la configuración de una tienda
 */
router.patch(
  '/stores/:storeId/settings',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(updateStoreSettingsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await storesService.updateSettings(
        req.params.storeId,
        req.body
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/stores/:storeId/members
 * Obtiene los miembros de una tienda
 */
router.get(
  '/stores/:storeId/members',
  authMiddleware,
  ownerOrAdminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await storesService.getMembers(req.params.storeId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/stores/:storeId/members/:memberId
 * Elimina (desactiva) un miembro de la tienda
 */
router.delete(
  '/stores/:storeId/members/:memberId',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(removeMemberSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await storesService.removeMember(
        req.params.storeId,
        req.params.memberId,
        req.user!.userId
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/stores/:storeId/delivery-members
 * Obtiene los repartidores de una tienda
 */
router.get(
  '/stores/:storeId/delivery-members',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await storesService.getDeliveryMembers(req.params.storeId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
