  "use client";

  import { useCart } from "@/hooks/useCart";
  import { PublicStore } from "@/types/store.types";
  import { ImageIcon } from "lucide-react";

  interface OrderSummaryProps {
    store: PublicStore;
  }

  export function OrderSummary({ store }: OrderSummaryProps) {
    const { cart, summary, formatPrice } = useCart();

    if (!cart) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6 sticky top-4">
        <h3 className="text-lg font-bold mb-4">Resumen del pedido</h3>

        {/* Items */}
        <div className="space-y-3 mb-4">
          {cart.items.map((item) => (
            <div key={item.product.id} className="flex gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                {item.product.image ? (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.product.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} x {formatPrice(item.product.price)}
                </p>
              </div>
              <p className="font-semibold">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">{formatPrice(summary.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Envío</span>
            <span className="font-semibold">
              {summary.deliveryFee > 0
                ? formatPrice(summary.deliveryFee)
                : "Por calcular"}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-lg text-blue-600">
              {formatPrice(summary.total)}
            </span>
          </div>
        </div>
      </div>
    );
  }