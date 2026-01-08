  "use client";

  import { useState } from "react";
  import { PublicStore } from "@/types/store.types";
  import { Button } from "@/components/ui/Button";
  import { Banknote, CreditCard } from "lucide-react";

  interface PaymentMethodStepProps {
    initialData?: { paymentMethod?: "CASH" | "TRANSFER" };
    store: PublicStore;
    onSubmit: (data: { paymentMethod: "CASH" | "TRANSFER" }) => void;
    onBack: () => void;
    submitting: boolean;
  }

  export function PaymentMethodStep({
    initialData,
    store,
    onSubmit,
    onBack,
    submitting,
  }: PaymentMethodStepProps) {
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | null>(
      initialData?.paymentMethod || null
    );

    const handleSubmit = () => {
      if (paymentMethod) {
        onSubmit({ paymentMethod });
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Método de pago</h2>

        <div className="space-y-4">
          {/* Cash Payment */}
          {store.paymentMethods.cash && (
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 ${
                paymentMethod === "CASH"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <Banknote className="w-8 h-8" />
              <div className="text-left flex-1">
                <p className="font-semibold">Pago en efectivo</p>
                <p className="text-sm text-gray-600">Paga al recibir tu pedido</p>
              </div>
            </button>
          )}

          {/* Transfer Payment */}
          {store.paymentMethods.transfer && (
            <button
              type="button"
              onClick={() => setPaymentMethod("TRANSFER")}
              className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 ${
                paymentMethod === "TRANSFER"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <CreditCard className="w-8 h-8" />
              <div className="text-left flex-1">
                <p className="font-semibold">Transferencia bancaria</p>
                <p className="text-sm text-gray-600">
                  Confirma el pago antes de la entrega
                </p>
              </div>
            </button>
          )}
        </div>

        {paymentMethod === "TRANSFER" && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Tu pedido quedará en estado <strong>PENDIENTE</strong> hasta que
              confirmes el pago. Recibirás los datos bancarios al completar el pedido.
            </p>
          </div>
        )}

        {!paymentMethod && (
          <p className="text-red-600 text-sm">Selecciona un método de pago</p>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onBack} disabled={submitting}>
            Atrás
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1"
            disabled={!paymentMethod || submitting}
          >
            {submitting ? "Procesando..." : "Confirmar pedido"}
          </Button>
        </div>
      </div>
    );
  }