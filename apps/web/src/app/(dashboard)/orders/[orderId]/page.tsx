"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ordersService } from "@/services/orders.service";
import { useAuth } from "@/hooks/useAuth";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderActions } from "@/components/orders/OrderActions";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { socketService } from "@/lib/socket";
import { useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  CreditCard,
  User,
  Package,
  Loader2,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Order } from "@/types/order.types";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentStore } = useAuth();
  const queryClient = useQueryClient();
  const orderId = params.orderId as string;

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersService.getById(currentStore!.id, orderId),
    enabled: !!currentStore && !!orderId,
  });

  // Real-time updates for this specific order
  useEffect(() => {
    const handleOrderUpdated = (updatedOrder: Order) => {
      if (updatedOrder.id === orderId) {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      }
    };

    const handleOrderStatusChanged = (data: { orderId: string }) => {
      if (data.orderId === orderId) {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      }
    };

    socketService.onOrderUpdated(handleOrderUpdated);
    socketService.onOrderStatusChanged(handleOrderStatusChanged);

    return () => {
      socketService.offOrderUpdated(handleOrderUpdated);
      socketService.offOrderStatusChanged(handleOrderStatusChanged);
    };
  }, [orderId, queryClient]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error al cargar el pedido</p>
        <Button onClick={() => router.push("/orders")} className="mt-4">
          Volver a pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 print:hidden">
        <Button
          variant="ghost"
          onClick={() => router.push("/orders")}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Pedido #{order.orderNumber}</h1>
          <p className="text-gray-600">
            {format(new Date(order.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", {
              locale: es,
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
        <Button variant="secondary" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          Imprimir
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Productos
              </h2>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b last:border-0"
                    >
                      {item.product?.image && (
                        <img
                          src={item.product.image}
                          alt={item.product?.name || "Producto"}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {item.product?.name || "Producto"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          €{(item.unitPrice || 0).toFixed(2)} ×{" "}
                          {item.quantity || 0}
                        </p>
                      </div>
                      <div className="font-semibold">
                        €{(item.subtotal || 0).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No hay productos en este pedido
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>€{(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>€{(order.deliveryFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>€{(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
          {/* Customer Notes */}
          {order.customerNotes && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-2">
                  Notas del cliente
                </h2>
                <p className="text-gray-700">{order.customerNotes}</p>
              </div>
            </Card>
          )}

          {/* Cancellation Info */}
          {order.status === "CANCELLED" && order.cancellationReason && (
            <Card>
              <div className="p-6 bg-red-50">
                <h2 className="text-lg font-semibold mb-2 text-red-800">
                  Pedido cancelado
                </h2>
                <p className="text-red-700">{order.cancellationReason}</p>
                {order.cancelledAt && (
                  <p className="text-sm text-red-600 mt-2">
                    Cancelado el{" "}
                    {format(
                      new Date(order.cancelledAt),
                      "d 'de' MMMM 'de' yyyy, HH:mm",
                      { locale: es }
                    )}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 print:hidden">
          {/* Customer Info */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Cliente
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 mt-0.5" />
                  <span>{order.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 mt-0.5" />
                  <span className="break-all">{order.customerEmail}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <div>
                    <p>{order.deliveryAddress}</p>
                    <p>{order.deliveryCity}</p>
                    {order.deliveryPostalCode && (
                      <p>{order.deliveryPostalCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Details */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Detalles</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo</span>
                  <span className="font-medium">
                    {order.type === "IMMEDIATE" ? "Inmediato" : "Programado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    Pago
                  </span>
                  <span className="font-medium">
                    {order.paymentMethod === "CASH"
                      ? "Efectivo"
                      : "Transferencia"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado de pago</span>
                  <span
                    className={`font-medium ${
                      order.paymentStatus === "CONFIRMED"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.paymentStatus === "CONFIRMED"
                      ? "Confirmado"
                      : "Pendiente"}
                  </span>
                </div>
                {order.deliveryZone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zona</span>
                    <span className="font-medium">
                      {order.deliveryZone.name}
                    </span>
                  </div>
                )}
                {order.deliveryPerson && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Repartidor</span>
                    <span className="font-medium">
                      {order.deliveryPerson.name}
                    </span>
                  </div>
                )}
                {order.estimatedDeliveryTime && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      ETA
                    </span>
                    <span className="font-medium text-right">
                      {format(new Date(order.estimatedDeliveryTime), "HH:mm", {
                        locale: es,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Scheduled Info */}
          {order.type === "SCHEDULED" &&
            order.scheduledDate &&
            order.scheduledSlot && (
              <Card>
                <div className="p-6 space-y-2">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Entrega programada
                  </h2>
                  <p className="font-medium">
                    {format(
                      new Date(order.scheduledDate),
                      "d 'de' MMMM 'de' yyyy",
                      { locale: es }
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.scheduledSlot.startTime} -{" "}
                    {order.scheduledSlot.endTime}
                  </p>
                </div>
              </Card>
            )}

          {/* Order Actions */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Acciones</h2>
              <OrderActions order={order} />
            </div>
          </Card>

          {/* Order Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Historial</h2>
                <OrderTimeline order={order} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
