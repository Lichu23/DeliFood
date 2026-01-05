"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  acceptInvitationSchema,
  AcceptInvitationInput,
} from "@/schemas/invitations.schema";
import { useInvitation } from "@/hooks/useInvitation";
import { useAuth } from "@/hooks/useAuth";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
} from "@/components/ui";
import { AxiosError } from "axios";
import Image from "next/image";

interface InvitationAcceptanceProps {
  token: string;
}

export function InvitationAcceptance({ token }: InvitationAcceptanceProps) {
  const {
    invitation,
    isLoading,
    error,
    acceptNew,
    acceptExisting,
    isAccepting,
    acceptError,
  } = useInvitation(token);
  const { isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationInput>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      token,
    },
  });

  const onSubmit = (data: AcceptInvitationInput) => {
    if (invitation?.userExists && isAuthenticated) {
      // User is already logged in, just accept
      acceptExisting();
    } else {
      // New user, create account
      acceptNew(data);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="py-8">
            <p className="text-center text-gray-600">Cargando invitación...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (invitation not found, expired, or used)
  if (error) {
    const errorMessage =
      (error as AxiosError<{ message: string }>)?.response?.data?.message ||
      "No se pudo cargar la invitación";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitación no válida</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="error">{errorMessage}</Alert>
            <Alert variant="error">{errorMessage}</Alert>
            <a href="/login" className="inline-block w-full mt-4">
              <Button className="w-full">Ir al inicio de sesión</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  const roleNames = {
    OWNER: "Propietario",
    ADMIN: "Administrador",
    CASHIER: "Cajero",
    DELIVERY: "Repartidor",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invitación a {invitation.store.name}</CardTitle>
          <CardDescription>
            {invitation.invitedBy} te ha invitado a unirte como{" "}
            {roleNames[invitation.role]}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Show store logo if available */}
          {invitation.store.logo && (
            <div className="mb-4 flex justify-center">
              <img
                src={invitation.store.logo}
                alt={invitation.store.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {invitation.email}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Rol:</strong> {roleNames[invitation.role]}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Expira:</strong>{" "}
              {new Date(invitation.expiresAt).toLocaleDateString("es-ES")}
            </p>
          </div>

          {/* Accept error */}
          {acceptError && (
            <Alert variant="error" className="mb-4">
              {(acceptError as AxiosError<{ message: string }>)?.response?.data
                ?.message || "Error al aceptar la invitación"}
            </Alert>
          )}

          {/* If user exists and is authenticated, just show accept button */}
          {invitation.userExists && isAuthenticated ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Ya tienes una cuenta. Haz click en aceptar para unirte a esta
                tienda.
              </p>
              <Button
                onClick={() => acceptExisting()}
                className="w-full"
                isLoading={isAccepting}
              >
                Aceptar Invitación
              </Button>
            </div>
          ) : (
            /* New user form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Completa los siguientes datos para crear tu cuenta y unirte.
              </p>

              <Input
                label="Nombre completo"
                placeholder="Juan Pérez"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Contraseña"
                type="password"
                placeholder="Mínimo 6 caracteres"
                error={errors.password?.message}
                {...register("password")}
              />

              <Input
                label="Teléfono (opcional)"
                type="tel"
                placeholder="+34 600 123 456"
                error={errors.phone?.message}
                {...register("phone")}
              />

              <input type="hidden" {...register("token")} />

              <Button type="submit" className="w-full" isLoading={isAccepting}>
                Crear cuenta y unirme
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Iniciar sesión
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
