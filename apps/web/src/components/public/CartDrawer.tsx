"use client";

import { useCart } from "@/hooks/useCart";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, isEmpty, clearCart } = useCart();
  const router = useRouter();
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClearCart = () => {
    if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    if (cart) {
      router.push(`/store/${cart.storeId}/checkout`);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={handleBackdropClick}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform
 duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="text-lg font-bold">Tu carrito</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-64px)]">
          {isEmpty ? (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-600 mb-4">
                Agrega productos para comenzar tu pedido
              </p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Ver productos
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Store Name */}
                {cart && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">Pedido de</p>
                    <p className="font-semibold">{cart.storeName}</p>
                  </div>
                )}

                {/* Items */}
                {cart?.items.map((item) => (
                  <CartItem key={item.product.id} item={item} />
                ))}

                {/* Clear Cart Button */}
                <button
                  onClick={handleClearCart}
                  className="w-full py-2 text-sm text-red-600 hover:text-red-700 flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Vaciar carrito
                </button>
              </div>

              {/* Footer - Summary & Checkout */}
              <div className="border-t bg-white p-4 space-y-4">
                <CartSummary />

                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Continuar con el pedido
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
