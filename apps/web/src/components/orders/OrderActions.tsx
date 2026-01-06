  import { useState } from 'react';
  import { useMutation, useQueryClient } from '@tanstack/react-query';
  import { Order, OrderStatus } from '@/types/order.types';
  import { ordersService } from '@/services/orders.service';
  import { useAuth } from '@/hooks/useAuth';
  import { Button } from '@/components/ui/Button';
  import { AssignDeliveryDialog } from './AssignDeliveryDialog';
  import { ConfirmPaymentDialog } from './ConfirmPaymentDialog';
  import { CancelOrderDialog } from './CancelOrderDialog';
  import {
    CheckCircle,
    ChefHat,
    Package,
    Truck,
    Ban,
    DollarSign,
    UserPlus
  } from 'lucide-react';
  import { Alert } from '@/components/ui/Alert';

  interface OrderActionsProps {
    order: Order;
  }

  // Define valid status transitions
  const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['PREPARING', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['ON_THE_WAY', 'CANCELLED'],
    ON_THE_WAY: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  // Status actions with different labels for immediate vs scheduled
  const getStatusActions = (status: OrderStatus, orderType: string) => {
    const baseActions: Record<OrderStatus, { label: string; icon: typeof CheckCircle }> = {
      PENDING: { label: 'Confirmar', icon: CheckCircle },
      CONFIRMED: { label: 'Preparar', icon: ChefHat },
      PREPARING: { label: 'Marcar listo', icon: Package },
      READY: {
        // ✅ Different label based on order type
        label: orderType === 'SCHEDULED' ? 'En camino' : 'Listo',
        icon: orderType === 'SCHEDULED' ? Truck : Package
      },
      ON_THE_WAY: { label: 'Entregar', icon: CheckCircle },
      DELIVERED: { label: 'Entregado', icon: CheckCircle },
      CANCELLED: { label: 'Cancelado', icon: Ban },
    };

    return baseActions[status];
  };

  interface ApiError {
    response?: {
      data?: {
        message?: string;
      };
    };
  }

  export function OrderActions({ order }: OrderActionsProps) {
    const { currentStore } = useAuth();
    const queryClient = useQueryClient();
    const [showAssignDelivery, setShowAssignDelivery] = useState(false);
    const [showConfirmPayment, setShowConfirmPayment] = useState(false);
    const [showCancelOrder, setShowCancelOrder] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update status mutation
    const updateStatusMutation = useMutation({
      mutationFn: (status: OrderStatus) =>
        ordersService.updateStatus(currentStore!.id, order.id, { status }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['order', order.id] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        setError(null);
      },
      onError: (err: unknown) => {
        const apiError = err as ApiError;
        setError(apiError.response?.data?.message || 'Error al actualizar el estado');
      },
    });

    const handleStatusChange = (newStatus: OrderStatus) => {
      updateStatusMutation.mutate(newStatus);
    };

    const nextStatuses = STATUS_FLOW[order.status] || [];
    const canCancel = nextStatuses.includes('CANCELLED');
    const needsPaymentConfirmation =
      order.paymentMethod === 'TRANSFER' &&
      order.paymentStatus === 'PENDING' &&
      order.status === 'PENDING';
    const canAssignDelivery =
      order.status === 'READY' &&
      !order.deliveryPersonId;

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-600">
          Este pedido está {order.status === 'DELIVERED' ? 'entregado' : 'cancelado'}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Payment Confirmation (for TRANSFER orders) */}
        {needsPaymentConfirmation && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 mb-3">
              Este pedido requiere confirmación de pago antes de continuar
            </p>
            <Button
              onClick={() => setShowConfirmPayment(true)}
              className="w-full"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Confirmar pago recibido
            </Button>
          </div>
        )}

        {/* Status Actions */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-gray-700">Cambiar estado</h3>
          <div className="grid grid-cols-1 gap-2">
            {nextStatuses
              .filter(status => status !== 'CANCELLED')
              .map((status) => {
                const action = getStatusActions(status, order.type);
                const Icon = action.icon;

                return (
                  <Button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updateStatusMutation.isPending}
                    className="w-full justify-center"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
          </div>
        </div>

        {/* Assign Delivery Person */}
        {canAssignDelivery && (
          <Button
            variant="secondary"
            onClick={() => setShowAssignDelivery(true)}
            className="w-full"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Asignar repartidor
          </Button>
        )}

        {/* Cancel Order */}
        {canCancel && (
          <Button
            variant="danger"
            onClick={() => setShowCancelOrder(true)}
            className="w-full"
          >
            <Ban className="w-4 h-4 mr-2" />
            Cancelar pedido
          </Button>
        )}

        {/* Dialogs */}
        <AssignDeliveryDialog
          open={showAssignDelivery}
          onClose={() => setShowAssignDelivery(false)}
          order={order}
        />

        <ConfirmPaymentDialog
          open={showConfirmPayment}
          onClose={() => setShowConfirmPayment(false)}
          order={order}
        />

        <CancelOrderDialog
          open={showCancelOrder}
          onClose={() => setShowCancelOrder(false)}
          order={order}
        />
      </div>
    );
  }