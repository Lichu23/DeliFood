  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';
  import { Cart, CartItem, CartSummary } from '@/types/cart.types';
  import { Product } from '@/types/product.types';

  interface CartStore {
    cart: Cart | null;

    // Actions
    initializeCart: (storeId: string, storeName: string, currency: 'EUR' | 'ARS') => void;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    // Getters
    getCartSummary: () => CartSummary;
    getItemQuantity: (productId: string) => number;
    isInCart: (productId: string) => boolean;
  }

  export const useCartStore = create<CartStore>()(
    persist(
      (set, get) => ({
        cart: null,

        // Initialize cart for a specific store
        initializeCart: (storeId, storeName, currency) => {
          const currentCart = get().cart;

          // If cart exists for same store, keep it
          if (currentCart && currentCart.storeId === storeId) {
            return;
          }

          // Otherwise, create new cart (clears old cart from different store)
          set({
            cart: {
              items: [],
              storeId,
              storeName,
              currency,
            },
          });
        },

        // Add item to cart or increase quantity if already exists
        addItem: (product, quantity = 1) => {
          const currentCart = get().cart;

          if (!currentCart) {
            console.error('Cart not initialized');
            return;
          }

          // Check if item already in cart
          const existingItemIndex = currentCart.items.findIndex(
            (item) => item.product.id === product.id
          );

          if (existingItemIndex >= 0) {
            // Item exists, increase quantity
            const updatedItems = [...currentCart.items];
            updatedItems[existingItemIndex].quantity += quantity;

            set({
              cart: {
                ...currentCart,
                items: updatedItems,
              },
            });
          } else {
            // New item, add to cart
            set({
              cart: {
                ...currentCart,
                items: [
                  ...currentCart.items,
                  { product, quantity },
                ],
              },
            });
          }
        },

        // Remove item from cart completely
        removeItem: (productId) => {
          const currentCart = get().cart;

          if (!currentCart) return;

          set({
            cart: {
              ...currentCart,
              items: currentCart.items.filter(
                (item) => item.product.id !== productId
              ),
            },
          });
        },

        // Update item quantity (or remove if quantity is 0)
        updateQuantity: (productId, quantity) => {
          const currentCart = get().cart;

          if (!currentCart) return;

          // If quantity is 0 or negative, remove item
          if (quantity <= 0) {
            get().removeItem(productId);
            return;
          }

          // Update quantity
          const updatedItems = currentCart.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          );

          set({
            cart: {
              ...currentCart,
              items: updatedItems,
            },
          });
        },

        // Clear all items from cart
        clearCart: () => {
          const currentCart = get().cart;

          if (!currentCart) return;

          set({
            cart: {
              ...currentCart,
              items: [],
            },
          });
        },

        // Calculate cart summary (subtotal, delivery fee, total)
        getCartSummary: () => {
          const currentCart = get().cart;

          if (!currentCart || currentCart.items.length === 0) {
            return {
              subtotal: 0,
              deliveryFee: 0,
              total: 0,
              itemCount: 0,
            };
          }

          const subtotal = currentCart.items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          // TODO: Calculate actual delivery fee based on delivery zone
          // For now, we'll set a default fee
          const deliveryFee = subtotal > 0 ? 5 : 0;

          const total = subtotal + deliveryFee;

          const itemCount = currentCart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          return {
            subtotal,
            deliveryFee,
            total,
            itemCount,
          };
        },

        // Get quantity of a specific product in cart
        getItemQuantity: (productId) => {
          const currentCart = get().cart;

          if (!currentCart) return 0;

          const item = currentCart.items.find(
            (item) => item.product.id === productId
          );

          return item ? item.quantity : 0;
        },

        // Check if product is in cart
        isInCart: (productId) => {
          const currentCart = get().cart;

          if (!currentCart) return false;

          return currentCart.items.some(
            (item) => item.product.id === productId
          );
        },
      }),
      {
        name: 'delifood-cart', // localStorage key
        // Only persist the cart data
        partialize: (state) => ({ cart: state.cart }),
      }
    )
  );