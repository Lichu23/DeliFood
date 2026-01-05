  'use client';

  import { useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { useAuthStore } from '@/store/authStore';

  export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const router = useRouter();
    const { token, user } = useAuthStore();

    useEffect(() => {
      // If user is already authenticated, redirect to dashboard
      if (token && user) {
        router.push('/orders');
      }
    }, [token, user, router]);

    // If authenticated, show loading while redirecting
    if (token && user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Redirigiendo...</p>
        </div>
      );
    }

    return <>{children}</>;
  }