  "use client";

  import { PublicOrderDetail } from "@/types/order.types";
  import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
  import { Package, MapPin, Clock, CheckCircle } from "lucide-react";
  import Link from "next/link";

  interface OrderTrackingProps {
    order: PublicOrderDetail;
  }

  export function OrderTracking({ order }: OrderTrackingProps) {
    const getStatusSteps = () => {
      const allStatuses = [
        { key: "PENDING", label: "Pendiente", icon: Clock },
        { key: "CONFIRMED", label: "Confirmado", icon: CheckCircle },
        { key: "PREPARING", label: "Preparando", icon: Package },
        { key: "READY", label: "Listo", icon: CheckCircle },
        { key: "ON_THE_WAY", label: "En camino", icon: MapPin },
        { key: "DELIVERED", label: "Entregado", icon: CheckCircle },
      ];

      // If payment is TRANSFER and order is PENDING, show different flow
      if (order.paymentMethod === "TRANSFER" && order.status === "PENDING") {
        return allStatuses;
      }

      // For CASH orders, skip CONFIRMED status
      if (order.paymentMethod === "CASH") {
        return allStatuses.filter((s) => s.key !== "CONFIRMED");
      }

      return allStatuses;
    };

    const getStatusIndex = (status: string) => {
      const steps = getStatusSteps();
      return steps.findIndex((s) => s.key === status);
    };

    const currentIndex = getStatusIndex(order.status);
    const steps = getStatusSteps();

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">Seguimiento de pedido</h1>
            <p className="text-gray-600 mb-4">
              Pedido <span className="font-semibold">#{order.orderNumber}</span>
            </p>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Estado del pedido</h2>
            <div className="space-y-6">
              {steps.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-1 h-12 ${
                            isCompleted ? "bg-blue-600" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <h3
                        className={`font-semibold ${
                          isCurrent ? "text-blue-600" : isCompleted ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <p className="text-sm text-gray-600 mt-1">Estado actual</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Información de entrega</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-semibold">Dirección:</span> {order.deliveryAddress},{" "}
                {order.deliveryCity}
              </p>
              {order.estimatedDeliveryTime && (
                <p className="text-gray-600">
                  <span className="font-semibold">Tiempo estimado:</span>{" "}
                  {order.estimatedDeliveryTime}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href={`/store/${order.store.slug}`}
              className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 font-semibold"   
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }