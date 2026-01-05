  'use client';

  import { useState } from 'react';
  import { Check, ChevronDown, Store } from 'lucide-react';
  import { useAuthStore } from '@/store/authStore';
  import { cn } from '@/lib/utils';

  export function StoreSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const { stores, currentStore, setCurrentStore } = useAuthStore();

    if (stores.length <= 1) {
      return (
        <div className="flex items-center gap-2 px-3 py-2">
          <Store className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {currentStore?.name || 'Mi Tienda'}
          </span>
        </div>
      );
    }

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Store className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {currentStore?.name || 'Seleccionar tienda'}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                  Tus tiendas
                </p>
                {stores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      setCurrentStore(store);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',      
                      currentStore?.id === store.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{store.name}</span>
                      <span className="text-xs text-gray-500">{store.role}</span>
                    </div>
                    {currentStore?.id === store.id && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }