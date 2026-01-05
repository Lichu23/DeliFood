  'use client';

  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { z } from 'zod';
  import { useMutation, useQueryClient } from '@tanstack/react-query';
  import { useAuth } from '@/hooks/useAuth';
  import { useAuthStore } from '@/store/authStore';
  import { authService } from '@/services/auth.service';
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    Button,
    Input,
    Alert,
  } from '@/components/ui';
  import { AxiosError } from 'axios';

  const profileSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
  });

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1, 'Contraseña actual requerida'),
      newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
      confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    });

  type ProfileInput = z.infer<typeof profileSchema>;
  type PasswordInput = z.infer<typeof passwordSchema>;

  export default function ProfilePage() {
    const { user } = useAuth();
    const { updateUser } = useAuthStore();
    const queryClient = useQueryClient();

    // Profile form
    const {
      register: registerProfile,
      handleSubmit: handleSubmitProfile,
      formState: { errors: profileErrors },
    } = useForm<ProfileInput>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      },
    });

    // Password form
    const {
      register: registerPassword,
      handleSubmit: handleSubmitPassword,
      formState: { errors: passwordErrors },
      reset: resetPassword,
    } = useForm<PasswordInput>({
      resolver: zodResolver(passwordSchema),
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
      mutationFn: (data: ProfileInput) => authService.updateProfile(data),
      onSuccess: (updatedUser) => {
        // Update Zustand store with new user data
        updateUser(updatedUser);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      },
    });

    // Change password mutation
    const changePasswordMutation = useMutation({
      mutationFn: (data: PasswordInput) => authService.changePassword(data),
      onSuccess: () => {
        resetPassword();
      },
    });

    const onSubmitProfile = (data: ProfileInput) => {
      updateProfileMutation.mutate(data);
    };

    const onSubmitPassword = (data: PasswordInput) => {
      changePasswordMutation.mutate(data);
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Actualiza tu información de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              {updateProfileMutation.isSuccess && (
                <Alert variant="success">Perfil actualizado correctamente</Alert>
              )}
              {updateProfileMutation.error && (
                <Alert variant="error">
                  {(updateProfileMutation.error as AxiosError<{ message: string }>)?.response?.data
                    ?.message || 'Error al actualizar perfil'}
                </Alert>
              )}

              <Input
                label="Nombre completo"
                placeholder="Juan Pérez"
                error={profileErrors.name?.message}
                {...registerProfile('name')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="juan@example.com"
                error={profileErrors.email?.message}
                {...registerProfile('email')}
              />

              <Input
                label="Teléfono (opcional)"
                type="tel"
                placeholder="+34 600 123 456"
                error={profileErrors.phone?.message}
                {...registerProfile('phone')}
              />

              <Button type="submit" isLoading={updateProfileMutation.isPending}>
                Guardar Cambios
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>
              Actualiza tu contraseña de acceso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              {changePasswordMutation.isSuccess && (
                <Alert variant="success">Contraseña actualizada correctamente</Alert>
              )}
              {changePasswordMutation.error && (
                <Alert variant="error">
                  {(changePasswordMutation.error as AxiosError<{ message: string }>)?.response
                    ?.data?.message || 'Error al cambiar contraseña'}
                </Alert>
              )}

              <Input
                label="Contraseña actual"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword')}
              />

              <Input
                label="Nueva contraseña"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />

              <Input
                label="Confirmar nueva contraseña"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />

              <Button type="submit" isLoading={changePasswordMutation.isPending}>
                Cambiar Contraseña
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
