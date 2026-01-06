"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Order } from "@/types/order.types";
import { ordersService } from "@/services/orders.service";
import { useAuth } from "@/hooks/useAuth";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DollarSign } from "lucide-react";

interface ConfirmPaymentDialogProps {
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

export function ConfirmPaymentDialog({
  open,
  onClose,
  order,
}: ConfirmPaymentDialogProps) {
  const { currentStore } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const confirmMutation = useMutation({
    mutationFn: () => ordersService.confirmPayment(currentStore!.id, order.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", order.id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      handleClose();
    },
    onError: (err: unknown) => {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message || "Error al confirmar el pago"
      );
    },
  });

  const handleConfirm = () => {
    confirmMutation.mutate();
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Confirmar pago"
      description="¿Has recibido el pago por transferencia?"
    >
      <div className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">
                Total del pedido: €{order.total.toFixed(2)}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Al confirmar, el pedido pasará automáticamente a estado
                Preparando
              </p>
            </div>
          </div>
        </div>

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
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
            isLoading={confirmMutation.isPending}
            className="flex-1"
          >
            Confirmar pago
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
