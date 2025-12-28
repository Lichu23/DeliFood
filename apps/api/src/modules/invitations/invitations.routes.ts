import { Router, Request, Response, NextFunction } from 'express';
import { invitationsService } from './invitations.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { ownerOrAdminMiddleware } from '../../middlewares/roles.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createInvitationSchema,
  acceptInvitationSchema,
  acceptInvitationExistingUserSchema,
} from './invitations.schema';

const router = Router();

/**
 * POST /api/stores/:storeId/invitations
 * Crea una nueva invitación (solo owner o admin)
 */
router.post(
  '/stores/:storeId/invitations',
  authMiddleware,
  ownerOrAdminMiddleware,
  validate(createInvitationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await invitationsService.create(
        req.params.storeId,
        req.user!.userId,
        req.body.email,
        req.body.role
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
 * GET /api/stores/:storeId/invitations
 * Lista las invitaciones de una tienda
 */
router.get(
  '/stores/:storeId/invitations',
  authMiddleware,
  ownerOrAdminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await invitationsService.listByStore(req.params.storeId);
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
 * GET /api/invitations/:token
 * Obtiene información de una invitación por token (público)
 */
router.get(
  '/invitations/:token',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await invitationsService.getByToken(req.params.token);
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
 * POST /api/invitations/accept
 * Acepta una invitación (usuario nuevo)
 */
router.post(
  '/invitations/accept',
  validate(acceptInvitationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await invitationsService.acceptNew(req.body.token, {
        name: req.body.name,
        password: req.body.password,
        phone: req.body.phone,
      });
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
 * POST /api/invitations/accept-existing
 * Acepta una invitación (usuario existente autenticado)
 */
router.post(
  '/invitations/accept-existing',
  authMiddleware,
  validate(acceptInvitationExistingUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await invitationsService.acceptExisting(
        req.body.token,
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
 * DELETE /api/stores/:storeId/invitations/:invitationId
 * Cancela una invitación
 */
router.delete(
  '/stores/:storeId/invitations/:invitationId',
  authMiddleware,
  ownerOrAdminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await invitationsService.cancel(
        req.params.invitationId,
        req.params.storeId
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
 * POST /api/stores/:storeId/invitations/:invitationId/resend
 * Reenvía una invitación
 */
router.post(
  '/stores/:storeId/invitations/:invitationId/resend',
  authMiddleware,
  ownerOrAdminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await invitationsService.resend(
        req.params.invitationId,
        req.params.storeId
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
