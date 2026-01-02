import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import prisma from './prisma';

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
    io = new Server(httpServer, {
        cors: {
          origin: [
            'http://localhost:3000',
            'http://localhost:5173',
            'null', // Para archivos locales
          ],
          methods: ['GET', 'POST'],
          credentials: true,
        },
      });

  // Middleware de autenticación
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = verifyToken(token);
      
      if (!payload) {
        return next(new Error('Invalid token'));
      }

      // Obtener usuario y sus tiendas
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          memberships: {
            where: { isActive: true },
            select: {
              storeId: true,
              role: true,
            },
          },
        },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      // Guardar datos en el socket
      socket.data.userId = user.id;
      socket.data.email = user.email;
      socket.data.stores = user.memberships.map((m) => ({
        storeId: m.storeId,
        role: m.role,
      }));

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.data.email}`);

    // Unir a las salas de sus tiendas
    socket.data.stores.forEach((store: { storeId: string }) => {
      socket.join(`store:${store.storeId}`);
      console.log(`User ${socket.data.email} joined store:${store.storeId}`);
    });

    // Escuchar actualización de ubicación del repartidor
    socket.on('delivery:location', async (data: { orderId: string; lat: number; lng: number }) => {
      try {
        const order = await prisma.order.findUnique({
          where: { id: data.orderId },
          select: { storeId: true, assignedToId: true },
        });

        if (order && order.assignedToId === socket.data.userId) {
          // Emitir ubicación a la tienda
          io.to(`store:${order.storeId}`).emit('delivery:location:updated', {
            orderId: data.orderId,
            lat: data.lat,
            lng: data.lng,
            timestamp: new Date().toISOString(),
          });

          // Emitir a la sala del pedido (para tracking público)
          io.to(`order:${data.orderId}`).emit('delivery:location:updated', {
            orderId: data.orderId,
            lat: data.lat,
            lng: data.lng,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error updating delivery location:', error);
      }
    });

    // Unirse a sala de tracking de pedido (público)
    socket.on('order:track', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`Socket joined order:${orderId}`);
    });

    // Salir de sala de tracking
    socket.on('order:untrack', (orderId: string) => {
      socket.leave(`order:${orderId}`);
      console.log(`Socket left order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.email}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Funciones de emisión de eventos

export function emitNewOrder(storeId: string, order: any) {
  if (io) {
    io.to(`store:${storeId}`).emit('order:new', order);
  }
}

export function emitOrderUpdated(storeId: string, order: any) {
  if (io) {
    io.to(`store:${storeId}`).emit('order:updated', order);
    io.to(`order:${order.id}`).emit('order:updated', order);
  }
}

export function emitOrderAssigned(storeId: string, order: any) {
  if (io) {
    io.to(`store:${storeId}`).emit('order:assigned', order);
  }
}

export function emitOrderCancelled(storeId: string, order: any) {
  if (io) {
    io.to(`store:${storeId}`).emit('order:cancelled', order);
    io.to(`order:${order.id}`).emit('order:cancelled', order);
  }
}