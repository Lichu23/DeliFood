import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';

import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';

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

const app = express();
const httpServer = createServer(app);

// Middlewares
app.use(helmet());
app.use(cors({
  origin: env.corsOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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