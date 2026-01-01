import { Router, Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { memberMiddleware, ownerOrAdminMiddleware } from '../../middlewares/roles.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  assignDeliverySchema,
  cancelOrderSchema,
  confirmPaymentSchema,
  customerCancelOrderSchema,
} from './orders.schema';

const router = Router();

/**
 * POST /api/stores/:slug/orders
 * Crear pedido (público - cliente)
 */
router.post(
  '/stores/:slug/orders',
  validate(createOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ordersService.create(req.params.slug, req.body);
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
 * GET /api/orders/:orderId/track
 * Tracking público de pedido
 */
router.get(
  '/orders/:orderId/track',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ordersService.getForTracking(req.params.orderId);
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
 * POST /api/orders/:orderId/cancel
 * Cancelar pedido (cliente)
 */
router.post(
  '/orders/:orderId/cancel',
  validate(customerCancelOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ordersService.cancelByCustomer(req.params.orderId);
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
 * GET /api/stores/:storeId/orders
 * Listar pedidos de una tienda
 */
router.get(
  '/stores/:storeId/orders',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ordersService.list(req.params.storeId, {
        status: req.query.status as any,
        type: req.query.type as any,
        date: req.query.date as string,
        assignedToId: req.query.assignedToId as string,
      });
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
 * GET /api/stores/:storeId/orders/:orderId
 * Obtener pedido por ID
 */
router.get(
  '/stores/:storeId/orders/:orderId',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ordersService.getById(
        req.params.storeId,
        req.params.orderId
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
 * PATCH /api/stores/:storeId/orders/:orderId/status
 * Actualizar estado del pedido
 */
router.patch(
  '/stores/:storeId/orders/:orderId/status',
  authMiddleware,
  memberMiddleware,
  validate(updateOrderStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ordersService.updateStatus(
        req.params.storeId,
        req.params.orderId,
        req.body.status
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
 * POST /api/stores/:storeId/orders/:orderId/assign
 * Asignar repartidor
 */
router.post(
  '/stores/:storeId/orders/:orderId/assign',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(assignDeliverySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ordersService.assignDelivery(
        req.params.storeId,
        req.params.orderId,
        req.body.deliveryUserId
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
 * POST /api/stores/:storeId/orders/:orderId/confirm-payment
 * Confirmar pago (transferencia)
 */
router.post(
  '/stores/:storeId/orders/:orderId/confirm-payment',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(confirmPaymentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ordersService.confirmPayment(
        req.params.storeId,
        req.params.orderId
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
 * POST /api/stores/:storeId/orders/:orderId/cancel
 * Cancelar pedido (tienda)
 */
router.post(
  '/stores/:storeId/orders/:orderId/cancel',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(cancelOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ordersService.cancelByStore(
        req.params.storeId,
        req.params.orderId,
        req.body.reason
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