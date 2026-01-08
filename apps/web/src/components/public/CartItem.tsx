  "use client";

  import { CartItem as CartItemType } from "@/types/cart.types";
  import { useCart } from "@/hooks/useCart";
  import { Plus, Minus, Trash2, ImageIcon } from "lucide-react";

  interface CartItemProps {
    item: CartItemType;
  }

  export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem, formatPrice } = useCart();

    const handleIncrement = () => {
      updateQuantity(item.product.id, item.quantity + 1);
    };

    const handleDecrement = () => {
      if (item.quantity > 1) {
        updateQuantity(item.product.id, item.quantity - 1);
      } else {
        handleRemove();
      }
    };

    const handleRemove = () => {
      removeItem(item.product.id);
    };

    const itemTotal = item.product.price * item.quantity;

    return (
      <div className="flex gap-3 bg-gray-50 rounded-lg p-3">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {item.product.image ? (
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">
                {item.product.name}
              </h4>
              <p className="text-sm text-gray-600">
                {formatPrice(item.product.price)}
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-gray-200 rounded ml-2 flex-shrink-0"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>

          {/* Quantity Controls & Total */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-white rounded-lg border">
              <button
                onClick={handleDecrement}
                className="p-1.5 hover:bg-gray-100 rounded-l-lg"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-semibold text-sm min-w-[24px] text-center">
                {item.quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="p-1.5 hover:bg-gray-100 rounded-r-lg"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="font-bold text-blue-600">
              {formatPrice(itemTotal)}
            </span>
          </div>
        </div>
      </div>
    );
  }