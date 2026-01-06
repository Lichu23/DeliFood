  import { OrderStatus } from '@/types/order.types';
  import { cn } from '@/lib/utils';

  interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
  }

  const STATUS_CONFIG: Record<
    OrderStatus,
    { label: string; className: string }
  > = {
    PENDING: {
      label: 'Pendiente',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    CONFIRMED: {
      label: 'Confirmado',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    PREPARING: {
      label: 'Preparando',
      className: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    READY: {
      label: 'Listo',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    ON_THE_WAY: {
      label: 'En camino',
      className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    },
    DELIVERED: {
      label: 'Entregado',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    CANCELLED: {
      label: 'Cancelado',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  };

  export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          config.className,
          className
        )}
      >
        {config.label}
      </span>
    );
  }