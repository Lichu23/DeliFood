import { Router, Request, Response, NextFunction } from 'express';
import { categoriesService } from './categories.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { memberMiddleware, ownerOrAdminMiddleware } from '../../middlewares/roles.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from './categories.schema';

const router = Router();

/**
 * GET /api/stores/:storeId/categories
 * Lista las categorías de una tienda
 */
router.get(
  '/stores/:storeId/categories',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const result = await categoriesService.list(req.params.storeId, includeInactive);
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
 * GET /api/stores/:storeId/categories/:categoryId
 * Obtiene una categoría por ID
 */
router.get(
  '/stores/:storeId/categories/:categoryId',
  authMiddleware,
  memberMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await categoriesService.getById(
        req.params.storeId,
        req.params.categoryId
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
 * POST /api/stores/:storeId/categories
 * Crea una nueva categoría
 */
router.post(
  '/stores/:storeId/categories',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(createCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await categoriesService.create(req.params.storeId, req.body);
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
 * PATCH /api/stores/:storeId/categories/:categoryId
 * Actualiza una categoría
 */
router.patch(
  '/stores/:storeId/categories/:categoryId',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(updateCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await categoriesService.update(
        req.params.storeId,
        req.params.categoryId,
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
 * DELETE /api/stores/:storeId/categories/:categoryId
 * Elimina una categoría
 */
router.delete(
  '/stores/:storeId/categories/:categoryId',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(deleteCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await categoriesService.delete(
        req.params.storeId,
        req.params.categoryId
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