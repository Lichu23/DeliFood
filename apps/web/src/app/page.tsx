 'use client';

  import { useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { useAuthStore } from '@/store/authStore';

  export default function HomePage() {
    const router = useRouter();
    const { token, user } = useAuthStore();

    useEffect(() => {
      // Redirect based on authentication status
      if (token && user) {
        router.push('/orders');
      } else {
        router.push('/login');
      }
    }, [token, user, router]);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }
