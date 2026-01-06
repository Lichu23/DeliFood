"use client"

  import { useState } from 'react';
  import { useMutation, useQueryClient } from '@tanstack/react-query';
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { Order } from '@/types/order.types';
  import { ordersService } from '@/services/orders.service';
  import { cancelOrderSchema, CancelOrderInput } from '@/schemas/order.schema';
  import { useAuth } from '@/hooks/useAuth';
  import { Dialog } from '@/components/ui/Dialog';
  import { Button } from '@/components/ui/Button';
  import { Alert } from '@/components/ui/Alert';

  interface CancelOrderDialogProps {
    open: boolean;
    onClose: () => void;
    order: Order;
  }

  interface ApiError {
    response?: {
      data?: {
        message?: string;
      };
    };
  }

  export function CancelOrderDialog({ open, onClose, order }: CancelOrderDialogProps) {
    const { currentStore } = useAuth();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm<CancelOrderInput>({
      resolver: zodResolver(cancelOrderSchema),
    });

    const cancelMutation = useMutation({
      mutationFn: (data: CancelOrderInput) =>
        ordersService.cancel(currentStore!.id, order.id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['order', order.id] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        handleClose();
      },
      onError: (err: unknown) => {
        const apiError = err as ApiError;
        setError(apiError.response?.data?.message || 'Error al cancelar el pedido');
      },
    });

    const onSubmit = (data: CancelOrderInput) => {
      cancelMutation.mutate(data);
    };

    const handleClose = () => {
      reset();
      setError(null);
      onClose();
    };

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        title="Cancelar pedido"
        description="Esta acción no se puede deshacer"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <Alert variant="warning">
            El pedido #{order.orderNumber} será cancelado. El cliente será notificado.
          </Alert>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de cancelación *
            </label>
            <textarea
              {...register('reason')}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explica por qué se cancela este pedido..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-500">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Volver
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={cancelMutation.isPending}
              isLoading={cancelMutation.isPending}
              className="flex-1"
            >
              Cancelar pedido
            </Button>
          </div>
        </form>
      </Dialog>
    );
  }