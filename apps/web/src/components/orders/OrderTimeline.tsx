  import { Order, OrderStatus } from '@/types/order.types';
  import { format } from 'date-fns';
  import { es } from 'date-fns/locale';
  import {
    CheckCircle,
    Clock,
    ChefHat,
    Package,
    Truck,
    Ban,
    LucideIcon
  } from 'lucide-react';

  interface OrderTimelineProps {
    order: Order;
  }

  const STATUS_CONFIG: Record<OrderStatus, { icon: LucideIcon; label: string; color: string }> = {
    PENDING: { icon: Clock, label: 'Pendiente', color: 'text-yellow-600' },
    CONFIRMED: { icon: CheckCircle, label: 'Confirmado', color: 'text-blue-600' },
    PREPARING: { icon: ChefHat, label: 'Preparando', color: 'text-orange-600' },
    READY: { icon: Package, label: 'Listo', color: 'text-purple-600' },
    ON_THE_WAY: { icon: Truck, label: 'En camino', color: 'text-cyan-600' },
    DELIVERED: { icon: CheckCircle, label: 'Entregado', color: 'text-green-600' },
    CANCELLED: { icon: Ban, label: 'Cancelado', color: 'text-red-600' },
  };

  export function OrderTimeline({ order }: OrderTimelineProps) {
    const history = order.statusHistory || [];

    if (history.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          No hay historial disponible
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {history.map((item, index) => {
          const config = STATUS_CONFIG[item.status];
          const Icon = config.icon;
          const isLast = index === history.length - 1;

          return (
            <div key={item.id} className="flex gap-4">
              {/* Timeline Icon */}
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-2 ${config.color} bg-gray-100`}>
                  <Icon className="w-4 h-4" />
                </div>
                {!isLast && (
                  <div className="w-0.5 h-full bg-gray-200 my-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{config.label}</h4>
                  <span className="text-xs text-gray-500">
                    {format(new Date(item.createdAt), "d MMM, HH:mm", { locale: es })}
                  </span>
                </div>
                {item.changedBy && (
                  <p className="text-sm text-gray-600 mt-1">
                    Por {item.changedBy.name}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
