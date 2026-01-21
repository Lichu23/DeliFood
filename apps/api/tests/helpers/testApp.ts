import express from 'express';
import cors from 'cors';
import { errorHandler } from '../../src/middlewares/error.middleware';

// Import routes
import authRoutes from '../../src/modules/auth/auth.routes';
import storesRoutes from '../../src/modules/stores/stores.routes';
import categoriesRoutes from '../../src/modules/categories/categories.routes';
import productsRoutes from '../../src/modules/products/products.routes';
import ordersRoutes from '../../src/modules/orders/orders.routes';

export function createTestApp() {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'test',
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api', storesRoutes);
  app.use('/api', categoriesRoutes);
  app.use('/api', productsRoutes);
  app.use('/api', ordersRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}
