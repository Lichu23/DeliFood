  import { useCartStore } from '@/store/cartStore';
  import { Product } from '@/types/product.types';

  export function useCart() {
    const {
      cart,
      initializeCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getCartSummary,
      getItemQuantity,
      isInCart,
    } = useCartStore();

    const summary = getCartSummary();

    return {
      // State
      cart,
      summary,

      // Computed
      isEmpty: !cart || cart.items.length === 0,
      itemCount: summary.itemCount,

      // Actions
      initializeCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,

      // Helpers
      getItemQuantity,
      isInCart,

      // Format price helper
      formatPrice: (price: number) => {
        if (!cart) return `$${price.toFixed(2)}`;
        const symbol = cart.currency === 'EUR' ? '€' : '$';
        return `${symbol}${price.toFixed(2)}`;
      },
    };
  }