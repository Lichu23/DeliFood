"use client";
  import { useState } from 'react';
  import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
  import { Order } from '@/types/order.types';
  import { ordersService } from '@/services/orders.service';
  import { useAuth } from '@/hooks/useAuth';
  import { Dialog } from '@/components/ui/Dialog';
  import { Button } from '@/components/ui/Button';
  import { Select } from '@/components/ui/Select';
  import { Alert } from '@/components/ui/Alert';
  import api from '@/lib/axios';

  interface AssignDeliveryDialogProps {
    open: boolean;
    onClose: () => void;
    order: Order;
  }

  interface StoreMember {
    userId: string;
    role: string;
    user: {
      name: string;
      email: string;
    };
  }

  interface ApiError {
    response?: {
      data?: {
        message?: string;
      };
    };
  }

  export function AssignDeliveryDialog({ open, onClose, order }: AssignDeliveryDialogProps) {
    const { currentStore } = useAuth();
    const queryClient = useQueryClient();
    const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Fetch delivery people (DELIVERY role members)
    const { data: members } = useQuery({
      queryKey: ['store-members', currentStore?.id],
      queryFn: async () => {
        const response = await api.get<{ data: StoreMember[] }>(`/stores/${currentStore!.id}/members`);
        return response.data.data;
      },
      enabled: !!currentStore && open,
    });

    const deliveryPeople = members?.filter((m) => m.role === 'DELIVERY') || [];

    const assignMutation = useMutation({
      mutationFn: (deliveryPersonId: string) =>
        ordersService.assignDeliveryPerson(currentStore!.id, order.id, { deliveryPersonId }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['order', order.id] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        handleClose();
      },
      onError: (err: unknown) => {
        const apiError = err as ApiError;
        setError(apiError.response?.data?.message || 'Error al asignar repartidor');
      },
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedDeliveryPerson) {
        setError('Selecciona un repartidor');
        return;
      }
      assignMutation.mutate(selectedDeliveryPerson);
    };

    const handleClose = () => {
      setSelectedDeliveryPerson('');
      setError(null);
      onClose();
    };

    const deliveryOptions = [
      { value: '', label: 'Selecciona un repartidor' },
      ...deliveryPeople.map((person) => ({
        value: person.userId,
        label: person.user.name,
      })),
    ];

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        title="Asignar repartidor"
        description="Selecciona el repartidor que entregará este pedido"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          {deliveryPeople.length === 0 ? (
            <Alert variant="warning">
              No hay repartidores disponibles. Invita miembros con rol de repartidor.
            </Alert>
          ) : (
            <Select
              label="Repartidor"
              value={selectedDeliveryPerson}
              onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
              options={deliveryOptions}
            />
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={assignMutation.isPending || deliveryPeople.length === 0}
              isLoading={assignMutation.isPending}
              className="flex-1"
            >
              Asignar
            </Button>
          </div>
        </form>
      </Dialog>
    );
  }