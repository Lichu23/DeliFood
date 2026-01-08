  "use client";

  import { PublicOrderDetail } from "@/types/order.types";
  import { CheckCircle, Clock, MapPin, Phone, Mail, Banknote, CreditCard, Package } from "lucide-react";
  import Link from "next/link";
  import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

  interface OrderConfirmationProps {
    order: PublicOrderDetail;
  }

  export function OrderConfirmation({ order }: OrderConfirmationProps) {
    const formatPrice = (price: number) => {
      const symbol = order.store.currency === "EUR" ? "€" : "$";
      return `${symbol}${price.toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Success Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">       
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">¡Pedido confirmado!</h1>
            <p className="text-gray-600 mb-4">
              Tu pedido ha sido recibido y está siendo procesado
            </p>
            <div className="bg-blue-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600 mb-1">Número de pedido</p>
              <p className="text-2xl font-bold text-blue-600">#{order.orderNumber}</p>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Estado del pedido</h2>
            <div className="flex items-center justify-between">
              <OrderStatusBadge status={order.status} />
              {order.estimatedDeliveryTime && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <div>
                    <p className="text-sm">Tiempo estimado de entrega</p>
                    <p className="font-semibold">{order.estimatedDeliveryTime}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Warning (Transfer) */}
          {order.paymentMethod === "TRANSFER" && order.paymentStatus === "PENDING" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Pendiente de confirmación de pago
              </h3>
              <p className="text-sm text-yellow-700">
                Tu pedido está en estado <strong>PENDIENTE</strong> hasta que confirmes
                el pago por transferencia. Por favor, realiza la transferencia a la
                cuenta bancaria de la tienda y notifica al comercio.
              </p>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Productos
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-gray-600">Cantidad: {item.quantity}</p>
                    <p className="text-gray-600">
                      Precio unitario: {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="font-semibold">{formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="font-bold">Total</span>
                <span className="font-bold text-blue-600">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Información de entrega
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tipo de pedido</p>
                <p className="font-semibold">
                  {order.orderType === "IMMEDIATE" ? "Entrega inmediata" : "Entrega programada"}
                </p>
              </div>
              {order.orderType === "SCHEDULED" && order.scheduledDate && (
                <div>
                  <p className="text-sm text-gray-600">Fecha y hora programada</p>
                  <p className="font-semibold">
                    {new Date(order.scheduledDate).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    - {order.scheduledTime}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Dirección de entrega</p>
                <p className="font-semibold">{order.deliveryAddress}</p>
                <p className="font-semibold">
                  {order.deliveryCity}
                  {order.deliveryPostalCode && `, ${order.deliveryPostalCode}`}
                </p>
              </div>
              {order.deliveryNotes && (
                <div>
                  <p className="text-sm text-gray-600">Notas de entrega</p>
                  <p className="font-semibold">{order.deliveryNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Datos del cliente</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-semibold">{order.customerPhone}</p>
                </div>
              </div>
              {order.customerEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{order.customerEmail}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Método de pago</h2>
            <div className="flex items-center gap-3">
              {order.paymentMethod === "CASH" ? (
                <>
                  <Banknote className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-semibold">Pago en efectivo</p>
                    <p className="text-sm text-gray-600">Pagar al recibir el pedido</p>
                  </div>
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-semibold">Transferencia bancaria</p>
                    <p className="text-sm text-gray-600">
                      Estado: {order.paymentStatus === "PENDING" ? "Pendiente" : "Confirmado"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Date */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Información del pedido</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha del pedido</span>
                <span className="font-semibold">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tienda</span>
                <span className="font-semibold">{order.store.name}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/store/${order.store.slug}`}
              className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 font-semibold"   
            >
              Volver a la tienda
            </Link>
            <Link
              href={`/track/${order.id}`}
              className="flex-1 bg-white border-2 border-blue-600 text-blue-600 text-center py-3 rounded-lg hover:bg-blue-50 font-semibold"
            >
              Seguir mi pedido
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-center mt-8 text-gray-600 text-sm">
            <p>
              Si tienes alguna pregunta sobre tu pedido, por favor contacta a la tienda
              directamente.
            </p>
          </div>
        </div>
      </div>
    );
  }