  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';
  import { User, Store } from '@/types/auth.types';

  interface AuthState {
    user: User | null;
    stores: Store[];
    currentStore: Store | null;
    token: string | null;
    _hasHydrated: boolean; // ← Add this

    setAuth: (user: User, stores: Store[], token: string) => void;
    setCurrentStore: (store: Store) => void;
    updateUser: (user: User) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void; // ← Add this
  }

  export const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        stores: [],
        currentStore: null,
        token: null,
        _hasHydrated: false, // ← Add this

        setAuth: (user, stores, token) => {
          localStorage.setItem('token', token);
          set({
            user,
            stores,
            token,
            currentStore: stores[0] || null,
          });
        },

        setCurrentStore: (store) => {
          set({ currentStore: store });
        },

        updateUser: (user) => {
          set({ user });
        },

        logout: () => {
          localStorage.removeItem('token');
          set({
            user: null,
            stores: [],
            currentStore: null,
            token: null,
          });
        },

        setHasHydrated: (state) => {
          set({ _hasHydrated: state });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          stores: state.stores,
          currentStore: state.currentStore,
          token: state.token,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    )
  );
