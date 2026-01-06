  'use client';

  import { useState } from 'react';
  import { OrdersList } from '@/components/orders/OrdersList';
  import { useRouter } from 'next/navigation';

  export default function OrdersPage() {
    const router = useRouter();

    const handleOrderClick = (orderId: string) => {
      router.push(`/orders/${orderId}`);
    };

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona todos los pedidos de tu tienda
            </p>
          </div>
        </div>

        {/* Orders List */}
        <OrdersList onOrderClick={handleOrderClick} />
      </div>
    );
  }