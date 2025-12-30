import { Router, Request, Response, NextFunction } from 'express';
import { blockedDatesService } from './blocked-dates.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { memberMiddleware, ownerOrAdminMiddleware } from '../../middlewares/roles.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createBlockedDateSchema,
  deleteBlockedDateSchema,
} from './blocked-dates.schema';

const router = Router();

/**
 * GET /api/stores/:storeId/blocked-dates
 * Lista las fechas bloqueadas
 */
router.get(
  '/stores/:storeId/blocked-dates',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const options: { from?: Date; to?: Date } = {};

      if (req.query.from) {
        options.from = new Date(req.query.from as string);
      }
      if (req.query.to) {
        options.to = new Date(req.query.to as string);
      }

      const result = await blockedDatesService.list(req.params.storeId, options);
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
 * POST /api/stores/:storeId/blocked-dates
 * Crea una fecha bloqueada
 */
router.post(
  '/stores/:storeId/blocked-dates',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(createBlockedDateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await blockedDatesService.create(req.params.storeId, req.body);
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
 * POST /api/stores/:storeId/blocked-dates/bulk
 * Crea múltiples fechas bloqueadas
 */
router.post(
  '/stores/:storeId/blocked-dates/bulk',
  authMiddleware,
  ownerOrAdminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await blockedDatesService.createMany(
        req.params.storeId,
        req.body.dates
      );
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
 * DELETE /api/stores/:storeId/blocked-dates/:blockedDateId
 * Elimina una fecha bloqueada
 */
router.delete(
  '/stores/:storeId/blocked-dates/:blockedDateId',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(deleteBlockedDateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await blockedDatesService.delete(
        req.params.storeId,
        req.params.blockedDateId
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