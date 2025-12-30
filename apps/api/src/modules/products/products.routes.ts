import { Router, Request, Response, NextFunction } from 'express';
import { productsService } from './products.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { memberMiddleware, ownerOrAdminMiddleware } from '../../middlewares/roles.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
} from './products.schema';

const router = Router();

/**
 * GET /api/stores/:storeId/products
 * Lista los productos de una tienda
 */
router.get(
  '/stores/:storeId/products',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productsService.list(req.params.storeId, {
        categoryId: req.query.categoryId as string,
        includeUnavailable: req.query.includeUnavailable === 'true',
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
 * GET /api/stores/:storeId/products/:productId
 * Obtiene un producto por ID
 */
router.get(
  '/stores/:storeId/products/:productId',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productsService.getById(
        req.params.storeId,
        req.params.productId
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
 * POST /api/stores/:storeId/products
 * Crea un nuevo producto
 */
router.post(
  '/stores/:storeId/products',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(createProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productsService.create(req.params.storeId, req.body);
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
 * PATCH /api/stores/:storeId/products/:productId
 * Actualiza un producto
 */
router.patch(
  '/stores/:storeId/products/:productId',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(updateProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productsService.update(
        req.params.storeId,
        req.params.productId,
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
 * DELETE /api/stores/:storeId/products/:productId
 * Elimina un producto
 */
router.delete(
  '/stores/:storeId/products/:productId',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(deleteProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productsService.delete(
        req.params.storeId,
        req.params.productId
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
 * POST /api/stores/:storeId/products/:productId/toggle-availability
 * Cambia la disponibilidad de un producto
 */
router.post(
  '/stores/:storeId/products/:productId/toggle-availability',
  authMiddleware,
  ownerOrAdminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productsService.toggleAvailability(
        req.params.storeId,
        req.params.productId
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