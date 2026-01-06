import { io, Socket } from 'socket.io-client';
  import { Order } from '@/types/order.types';

  const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

  class SocketService {
    private socket: Socket | null = null;
    private token: string | null = null;

    connect(token: string) {
      if (this.socket?.connected) {
        return this.socket;
      }

      this.token = token;

      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket.io connected');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket.io disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error);
      });

      return this.socket;
    }

    disconnect() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.token = null;
      }
    }

    getSocket(): Socket | null {
      return this.socket;
    }

    isConnected(): boolean {
      return this.socket?.connected || false;
    }

    // Join a store room to receive store-specific events
    joinStore(storeId: string) {
      if (this.socket?.connected) {
        this.socket.emit('join-store', storeId);
      }
    }

    // Leave a store room
    leaveStore(storeId: string) {
      if (this.socket?.connected) {
        this.socket.emit('leave-store', storeId);
      }
    }

    // Listen to order events - UPDATED TO MATCH BACKEND EVENT NAMES
    onOrderCreated(callback: (order: Order) => void) {
      // Backend emits 'order:new' not 'order:created'
      this.socket?.on('order:new', callback);
    }

    onOrderUpdated(callback: (order: Order) => void) {
      // Listen for order:updated
      this.socket?.on('order:updated', callback);
    }

    onOrderStatusChanged(callback: (data: { orderId: string; status: string }) => void) {
      // Listen for order:status-changed
      this.socket?.on('order:status-changed', callback);
    }

    // Remove listeners - UPDATED TO MATCH BACKEND EVENT NAMES
    offOrderCreated(callback: (order: Order) => void) {
      this.socket?.off('order:new', callback);
    }

    offOrderUpdated(callback: (order: Order) => void) {
      this.socket?.off('order:updated', callback);
    }

    offOrderStatusChanged(callback: (data: { orderId: string; status: string }) => void) {
      this.socket?.off('order:status-changed', callback);
    }
  }

  export const socketService = new SocketService();