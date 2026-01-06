  import { Order } from '@/types/order.types';
  import { OrderStatusBadge } from './OrderStatusBadge';
  import { Card } from '@/components/ui/Card';
  import { formatDistanceToNow } from 'date-fns';
  import { es } from 'date-fns/locale';
  import { Clock, MapPin, CreditCard, User, Package } from 'lucide-react';

  interface OrderCardProps {
    order: Order;
    onClick?: () => void;
  }

  export function OrderCard({ order, onClick }: OrderCardProps) {
    const formattedDate = formatDistanceToNow(new Date(order.createdAt), {
      addSuffix: true,
      locale: es,
    });

    const itemsCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
      <Card
        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Customer Info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{order.deliveryAddress || 'Sin dirección'}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              <span>{itemsCount} items</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              <span>{order.paymentMethod === 'CASH' ? 'Efectivo' : 'Transferencia'}</span>
            </div>
          </div>
          <div className="font-bold text-lg">
            €{order.total.toFixed(2)}
          </div>
        </div>

        {/* Delivery Person (if assigned) */}
        {order.deliveryPerson && (
          <div className="mt-2 pt-2 border-t text-sm text-gray-600">
            <span className="font-medium">Repartidor:</span> {order.deliveryPerson.name}
          </div>
        )}
      </Card>
    );
  }