import { Router, Request, Response, NextFunction } from 'express';
import { deliverySlotsService } from './delivery-slots.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { memberMiddleware, ownerOrAdminMiddleware } from '../../middlewares/roles.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createDeliverySlotSchema,
  updateDeliverySlotSchema,
  deleteDeliverySlotSchema,
} from './delivery-slots.schema';

const router = Router();

/**
 * GET /api/stores/:storeId/delivery-slots
 * Lista las franjas horarias
 */
router.get(
  '/stores/:storeId/delivery-slots',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const result = await deliverySlotsService.list(req.params.storeId, includeInactive);
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
 * GET /api/stores/:storeId/delivery-slots/day/:dayOfWeek
 * Lista franjas por día
 */
router.get(
  '/stores/:storeId/delivery-slots/day/:dayOfWeek',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dayOfWeek = parseInt(req.params.dayOfWeek, 10);
      const result = await deliverySlotsService.listByDay(req.params.storeId, dayOfWeek);
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
 * GET /api/stores/:storeId/delivery-slots/:slotId
 * Obtiene una franja por ID
 */
router.get(
  '/stores/:storeId/delivery-slots/:slotId',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await deliverySlotsService.getById(
        req.params.storeId,
        req.params.slotId
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
 * POST /api/stores/:storeId/delivery-slots
 * Crea una nueva franja
 */
router.post(
  '/stores/:storeId/delivery-slots',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(createDeliverySlotSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await deliverySlotsService.create(req.params.storeId, req.body);
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
 * PATCH /api/stores/:storeId/delivery-slots/:slotId
 * Actualiza una franja
 */
router.patch(
  '/stores/:storeId/delivery-slots/:slotId',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(updateDeliverySlotSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await deliverySlotsService.update(
        req.params.storeId,
        req.params.slotId,
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
 * DELETE /api/stores/:storeId/delivery-slots/:slotId
 * Elimina una franja
 */
router.delete(
  '/stores/:storeId/delivery-slots/:slotId',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(deleteDeliverySlotSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await deliverySlotsService.delete(
        req.params.storeId,
        req.params.slotId
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