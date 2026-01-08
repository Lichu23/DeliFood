  "use client";

  import { useCart } from "@/hooks/useCart";

  export function CartSummary() {
    const { summary, formatPrice } = useCart();

    return (
      <div className="space-y-2">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">{formatPrice(summary.subtotal)}</span>
        </div>

        {/* Delivery Fee */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Envío</span>
          <span className="font-semibold">
            {summary.deliveryFee > 0
              ? formatPrice(summary.deliveryFee)
              : "Por calcular"}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t pt-2"></div>

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-lg text-blue-600">
            {formatPrice(summary.total)}
          </span>
        </div>

        {/* Item Count */}
        <p className="text-xs text-gray-600 text-center">
          {summary.itemCount} {summary.itemCount === 1 ? "producto" : "productos"}
        </p>
      </div>
    );
  }