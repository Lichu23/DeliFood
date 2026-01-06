  'use client';

  import { useState, useEffect, useMemo } from 'react';
  import { useQuery, useQueryClient } from '@tanstack/react-query';
  import { ordersService } from '@/services/orders.service';
  import { Order } from '@/types/order.types';
  import { OrderCard } from './OrderCard';
  import { OrderFilters, FilterValues } from './OrderFilters';
  import { useAuth } from '@/hooks/useAuth';
  import { socketService } from '@/lib/socket';
  import { Loader2, Package, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';
  import { Button } from '@/components/ui/Button';

  interface OrdersListProps {
    onOrderClick?: (orderId: string) => void;
  }

  const SOUND_STORAGE_KEY = 'delifood_sound_enabled';

  // Helper function to check if date is in range
  function isDateInRange(dateStr: string, range: string): boolean {
    const orderDate = new Date(dateStr);
    orderDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
      case 'today':
        return orderDate.getTime() === today.getTime();

      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return orderDate.getTime() === yesterday.getTime();

      case 'last7days':
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        return orderDate >= last7Days && orderDate <= today;

      case 'last30days':
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        return orderDate >= last30Days && orderDate <= today;

      default:
        return true;
    }
  }

  export function OrdersList({ onOrderClick }: OrdersListProps) {
    const { currentStore } = useAuth();
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<FilterValues>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState('');
    const [page, setPage] = useState(1);
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    const [soundEnabled, setSoundEnabled] = useState(() => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(SOUND_STORAGE_KEY);
        return saved === 'true';
      }
      return false;
    });

    const limit = 20;

    useEffect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled.toString());
      }
    }, [soundEnabled]);

    const {
      data,
      isLoading,
      isError,
      error,
    } = useQuery({
      queryKey: ['orders', currentStore?.id, filters, page],
      queryFn: async () => {
        const result = await ordersService.list(currentStore!.id, filters, page, limit);
        return result;
      },
      enabled: !!currentStore,
    });

    // Client-side filtering (search + date range)
    const filteredOrders = useMemo(() => {
      const orders = data?.orders || [];

      let filtered = orders;

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();

        filtered = filtered.filter((order) => {
          const customerName = order.customerName?.toLowerCase() || '';
          const customerPhone = order.customerPhone?.toLowerCase() || '';
          const customerEmail = order.customerEmail?.toLowerCase() || '';
          const orderNumber = order.orderNumber?.toString() || '';

          return (
            customerName.includes(query) ||
            customerPhone.includes(query) ||
            customerEmail.includes(query) ||
            orderNumber.includes(query)
          );
        });
      }

      // Apply date range filter
      if (dateRange) {
        filtered = filtered.filter((order) => {
          return isDateInRange(order.createdAt, dateRange);
        });
      }

      return filtered;
    }, [data?.orders, searchQuery, dateRange]);

    // Socket.io real-time updates
    useEffect(() => {
      const handleOrderCreated = (order: Order) => {
        console.log('🔔 New order received!', order);
        queryClient.invalidateQueries({ queryKey: ['orders'] });

        if (soundEnabled) {
          playNotificationSound();
        }
        showBrowserNotification('Nuevo pedido', `Pedido #${order.orderNumber} de ${order.customerName}`);
      };

      const handleOrderUpdated = (order: Order) => {
        console.log('🔄 Order updated!', order);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      };

      const handleOrderStatusChanged = (data: { orderId: string; status: string }) => {
        console.log('📝 Order status changed!', data);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      };

      const handleConnect = () => {
        console.log('✅ Socket Connected');
        setIsSocketConnected(true);
      };

      const handleDisconnect = () => {
        console.log('❌ Socket Disconnected');
        setIsSocketConnected(false);
      };

      socketService.onOrderCreated(handleOrderCreated);
      socketService.onOrderUpdated(handleOrderUpdated);
      socketService.onOrderStatusChanged(handleOrderStatusChanged);

      const socket = socketService.getSocket();
      if (socket) {
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        Promise.resolve().then(() => {
          if (socket.connected) {
            setIsSocketConnected(true);
          }
        });
      }

      return () => {
        socketService.offOrderCreated(handleOrderCreated);
        socketService.offOrderUpdated(handleOrderUpdated);
        socketService.offOrderStatusChanged(handleOrderStatusChanged);

        if (socket) {
          socket.off('connect', handleConnect);
          socket.off('disconnect', handleDisconnect);
        }
      };
    }, [queryClient, currentStore?.id, soundEnabled]);

    const handleEnableSound = () => {
      playNotificationSound()
        .then(() => {
          setSoundEnabled(true);
          showBrowserNotification('Sonido activado', 'Recibirás notificaciones sonoras para nuevos pedidos');
        })
        .catch(() => {
          console.warn('Could not enable sound');
        });
    };

    if (!currentStore) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay tienda seleccionada</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500">
            Error al cargar pedidos: {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </div>
      );
    }

    const totalPages = data ? Math.ceil(data.total / limit) : 0;

    return (
      <div className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Socket Connection */}
            <div className="flex items-center gap-2">
              {isSocketConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Conectado en tiempo real</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Sin conexión en tiempo real</span>
                </>
              )}
            </div>

            {/* Sound Toggle */}
            {isSocketConnected && (
              <Button
                variant={soundEnabled ? "primary" : "secondary"}
                size="sm"
                onClick={() => {
                  if (soundEnabled) {
                    setSoundEnabled(false);
                  } else {
                    handleEnableSound();
                  }
                }}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 mr-1" />
                    Sonido ON
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 mr-1" />
                    Activar sonido
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <OrderFilters
          filters={filters}
          searchQuery={searchQuery}
          dateRange={dateRange}
          onFilterChange={setFilters}
          onSearchChange={setSearchQuery}
          onDateRangeChange={setDateRange}
        />

        {/* Orders Count */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''}
            {(searchQuery || dateRange) && ` (filtrados)`}
          </h2>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No hay pedidos
            </h3>
            <p className="text-gray-500">
              {searchQuery || dateRange
                ? 'No se encontraron pedidos con los filtros aplicados'
                : 'Aún no hay pedidos en tu tienda'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => onOrderClick?.(order.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !searchQuery && !dateRange && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    );
  }
  
function playNotificationSound(): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const audio = new Audio("/sounds/notification.wav");
      audio.volume = 0.3;
      return audio
        .play()
        .then(() => {
          console.log("✅ Sound played");
        })
        .catch((error) => {
          console.warn("⚠️ Sound autoplay blocked:", error.message);
          throw error;
        });
    } catch (error) {
      console.error("❌ Sound error:", error);
      return Promise.reject(error);
    }
  }
  return Promise.resolve();
}

function showBrowserNotification(title: string, body: string) {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  }
}
