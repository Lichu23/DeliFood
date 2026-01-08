  "use client";

  import { Product } from "@/types/product.types";
  import { PublicStore } from "@/types/store.types";
  import { ImageIcon, Plus, Minus } from "lucide-react";
  import { useCart } from "@/hooks/useCart";

  interface ProductCardProps {
    product: Product;
    store: PublicStore;
    onProductClick: (product: Product) => void;
  }

  export function ProductCard({ product, store, onProductClick }: ProductCardProps) {
    const { addItem, updateQuantity, getItemQuantity, formatPrice } = useCart();
    const quantity = getItemQuantity(product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
      e.stopPropagation();
      addItem(product, 1);
    };

    const handleIncrement = (e: React.MouseEvent) => {
      e.stopPropagation();
      updateQuantity(product.id, quantity + 1);
    };

    const handleDecrement = (e: React.MouseEvent) => {
      e.stopPropagation();
      updateQuantity(product.id, quantity - 1);
    };

    return (
      <div
        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => onProductClick(product)}
      >
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>

            {/* Add to Cart or Quantity Controls */}
            {quantity === 0 ? (
              <button
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                onClick={handleAddToCart}
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            ) : (
              <div
                className="flex items-center gap-2 bg-blue-100 rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="p-2 hover:bg-blue-200 rounded-l-lg"
                  onClick={handleDecrement}
                >
                  <Minus className="w-4 h-4 text-blue-600" />
                </button>
                <span className="font-bold text-blue-600 min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  className="p-2 hover:bg-blue-200 rounded-r-lg"
                  onClick={handleIncrement}
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }