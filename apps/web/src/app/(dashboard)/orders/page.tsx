'use client';

import { useAuthStore } from '@/store/authStore';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function OrdersPage() {
  const { user, currentStore } = useAuthStore();
  const { logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard - Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p><strong>Usuario:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Tienda:</strong> {currentStore?.name}</p>
              <p><strong>Rol:</strong> {currentStore?.role}</p>
            </div>

            <p className="text-gray-600">
              ✅ Fase 1 completada. La conexión con el backend funciona correctamente.
            </p>
            <p className="text-gray-600">
              En la Fase 2 agregaremos el sidebar, header y la lista de pedidos.
            </p>

            <Button variant="danger" onClick={logout}>
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}