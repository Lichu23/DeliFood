import { Router, Request, Response, NextFunction } from 'express';
import { deliveryZonesService } from './delivery-zones.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { memberMiddleware, ownerOrAdminMiddleware } from '../../middlewares/roles.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createDeliveryZoneSchema,
  updateDeliveryZoneSchema,
  deleteDeliveryZoneSchema,
} from './delivery-zones.schema';

const router = Router();

/**
 * GET /api/stores/:storeId/delivery-zones
 * Lista las zonas de entrega
 */
router.get(
  '/stores/:storeId/delivery-zones',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const result = await deliveryZonesService.list(req.params.storeId, includeInactive);
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
 * GET /api/stores/:storeId/delivery-zones/:zoneId
 * Obtiene una zona por ID
 */
router.get(
  '/stores/:storeId/delivery-zones/:zoneId',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await deliveryZonesService.getById(
        req.params.storeId,
        req.params.zoneId
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
 * POST /api/stores/:storeId/delivery-zones
 * Crea una nueva zona
 */
router.post(
  '/stores/:storeId/delivery-zones',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(createDeliveryZoneSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await deliveryZonesService.create(req.params.storeId, req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/stores/:storeId/delivery-zones/:zoneId
 * Actualiza una zona
 */
router.patch(
  '/stores/:storeId/delivery-zones/:zoneId',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(updateDeliveryZoneSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await deliveryZonesService.update(
        req.params.storeId,
        req.params.zoneId,
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
 * DELETE /api/stores/:storeId/delivery-zones/:zoneId
 * Elimina una zona
 */
router.delete(
  '/stores/:storeId/delivery-zones/:zoneId',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(deleteDeliveryZoneSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await deliveryZonesService.delete(
        req.params.storeId,
        req.params.zoneId
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

export default router;