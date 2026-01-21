import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';

import { env } from './config/env';
import { corsConfig, getHelmetConfig, securityConstants } from './config/security';
import { errorHandler } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import { sanitizeMiddleware } from './middlewares/sanitize.middleware';
import { originValidationMiddleware, getCsrfTokenHandler } from './middlewares/csrf.middleware';

// Routes
import authRoutes from './modules/auth/auth.routes';
import storesRoutes from './modules/stores/stores.routes';
import invitationsRoutes from './modules/invitations/invitations.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import productsRoutes from './modules/products/products.routes';
import uploadsRoutes from './modules/uploads/uploads.routes';
import deliveryZonesRoutes from './modules/delivery-zones/delivery-zones.routes';
import deliverySlotsRoutes from './modules/delivery-slots/delivery-slots.routes';
import blockedDatesRoutes from './modules/blocked-dates/blocked-dates.routes';
import ordersRoutes from './modules/orders/orders.routes';
import metricsRoutes from './modules/metrics/metrics.routes';

const app = express();
const httpServer = createServer(app);

// Security Middlewares
app.use(helmet(getHelmetConfig()));
app.use(cors(corsConfig));

// Compression & Parsing
app.use(compression());
app.use(express.json({ limit: securityConstants.maxJsonSize }));
app.use(express.urlencoded({ extended: true, limit: securityConstants.maxUrlencodedSize }));

// Input Sanitization (XSS prevention)
app.use(sanitizeMiddleware);

// CSRF Protection (Origin validation)
app.use('/api', originValidationMiddleware);

// Rate limiting
app.use('/api', apiLimiter);

// Logging
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// CSRF Token endpoint
app.get('/api/csrf-token', getCsrfTokenHandler);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', storesRoutes);
app.use('/api', invitationsRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', productsRoutes);
app.use('/api', uploadsRoutes);
app.use('/api', deliveryZonesRoutes);
app.use('/api', deliverySlotsRoutes);
app.use('/api', blockedDatesRoutes);
app.use('/api', ordersRoutes);
app.use('/api', metricsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

export { app, httpServer };