  "use client";

  import { Product } from "@/types/product.types";
  import { PublicStore } from "@/types/store.types";
  import { useCart } from "@/hooks/useCart";
  import { X, ImageIcon, Plus, Minus } from "lucide-react";
  import { useState } from "react";

  interface ProductDetailModalProps {
    product: Product;
    store: PublicStore;
    isOpen: boolean;
    onClose: () => void;
  }

  export function ProductDetailModal({
    product,
    store,
    isOpen,
    onClose,
  }: ProductDetailModalProps) {
    const { addItem, updateQuantity, getItemQuantity, formatPrice } = useCart();
    const cartQuantity = getItemQuantity(product.id);
    const [localQuantity, setLocalQuantity] = useState(1);

    if (!isOpen) return null;

    const handleAddToCart = () => {
      if (cartQuantity === 0) {
        // If not in cart, add with local quantity
        addItem(product, localQuantity);
      } else {
        // If already in cart, increase by local quantity
        updateQuantity(product.id, cartQuantity + localQuantity);
      }
      onClose();
    };

    const handleIncrement = () => {
      setLocalQuantity((prev) => prev + 1);
    };

    const handleDecrement = () => {
      setLocalQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    };

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Detalle del producto</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Product Image */}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
              {product.description && (
                <p className="text-gray-600 mb-4">{product.description}</p>
              )}
              <div className="text-3xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrement}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold min-w-[40px] text-center">
                  {localQuantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"       
            >
              {cartQuantity === 0
                ? `Agregar al carrito - ${formatPrice(product.price * localQuantity)}`
                : `Actualizar cantidad - ${formatPrice(product.price * localQuantity)}`}
            </button>

            {/* Already in cart notice */}
            {cartQuantity > 0 && (
              <p className="text-sm text-gray-600 text-center mt-2">
                Ya tienes {cartQuantity} {cartQuantity === 1 ? "unidad" : "unidades"} en el carrito
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }