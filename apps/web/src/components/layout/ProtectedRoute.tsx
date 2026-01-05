'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('OWNER' | 'ADMIN' | 'CASHIER' | 'DELIVERY')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, currentStore, token } = useAuthStore();

  useEffect(() => {
    // Si no hay token, redirigir a login
    if (!token) {
      router.push('/login');
      return;
    }

    // Si hay roles permitidos y el usuario no tiene ese rol
    if (allowedRoles && currentStore && !allowedRoles.includes(currentStore.role)) {
      router.push('/orders'); // Redirigir a página por defecto
    }
  }, [token, currentStore, allowedRoles, router]);

  // Mostrar loading mientras verifica
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  // Si hay roles permitidos y el usuario no tiene ese rol
  if (allowedRoles && currentStore && !allowedRoles.includes(currentStore.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  return <>{children}</>;
}