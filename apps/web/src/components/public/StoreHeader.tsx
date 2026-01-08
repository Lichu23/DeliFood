  "use client";

  import { PublicStore } from "@/types/store.types";
  import { Store, ShoppingCart } from "lucide-react";
  import { useCart } from "@/hooks/useCart";
  import { useEffect, useState } from "react";
  import { CartDrawer } from "./CartDrawer";

  interface StoreHeaderProps {
    store: PublicStore;
  }

  export function StoreHeader({ store }: StoreHeaderProps) {
    const { initializeCart, itemCount } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Initialize cart when component mounts
    useEffect(() => {
      initializeCart(store.id, store.name, store.currency);
    }, [store.id, store.name, store.currency, initializeCart]);

    return (
      <>
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Store Info */}
              <div className="flex items-center gap-3">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold">{store.name}</h1>
                  {store.description && (
                    <p className="text-sm text-gray-600">{store.description}</p>
                  )}
                </div>
              </div>

              {/* Cart Button */}
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">Ver carrito</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Cart Drawer */}
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </>
    );
  }