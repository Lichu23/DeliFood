import { Router, Request, Response, NextFunction } from 'express';
import { metricsService } from './metrics.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { ownerOrAdminMiddleware } from '../../middlewares/roles.middleware';

const router = Router();

/**
 * GET /api/stores/:storeId/metrics
 * Obtiene métricas de la tienda
 */
router.get(
  '/stores/:storeId/metrics',
  authMiddleware,
  ownerOrAdminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const options: { from?: Date; to?: Date } = {};

      if (req.query.from) {
        options.from = new Date(req.query.from as string);
      }
      if (req.query.to) {
        options.to = new Date(req.query.to as string);
      }

      const result = await metricsService.getStoreMetrics(
        req.params.storeId,
        options
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
 * GET /api/stores/:storeId/metrics/today
 * Obtiene métricas de hoy
 */
router.get(
  '/stores/:storeId/metrics/today',
  authMiddleware,
  ownerOrAdminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await metricsService.getTodayMetrics(req.params.storeId);

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