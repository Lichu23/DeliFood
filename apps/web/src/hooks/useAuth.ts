'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { LoginInput, RegisterInput } from '@/schemas/auth.schema';

export function useAuth() {
  const router = useRouter();
  const { user, currentStore, setAuth, logout: storeLogout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.stores, response.token);
      router.push('/orders');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: (response) => {
      setAuth(
        response.user,
        [{
          id: response.store.id,
          name: response.store.name,
          slug: response.store.slug,
          currency: response.store.currency as 'EUR' | 'ARS',
          role: 'OWNER',
          isActive: true,
        }],
        response.token
      );
      router.push('/orders');
    },
  });

  const logout = () => {
    storeLogout();
    router.push('/login');
  };

  return {
    user,
    currentStore,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout,
  };
}