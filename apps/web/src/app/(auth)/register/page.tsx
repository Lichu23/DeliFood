"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, RegisterInput } from "@/schemas/auth.schema";
import {
  Button,
  Input,
  Select,
  Checkbox,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
} from "@/components/ui";

const STEPS = [
  { id: 1, title: "Datos Personales" },
  { id: 2, title: "Datos de la Tienda" },
  { id: 3, title: "Configuración de Pagos" },
  { id: 4, title: "Horarios de Entrega" },
  { id: 5, title: "Zona de Entrega" },
];

const DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const { register: registerUser, isRegistering, registerError } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptsCash: true,
      acceptsTransfer: false,
      currency: "EUR",
      minAdvanceHours: 2,
      maxAdvanceDays: 7,
      immediateCancelMinutes: 5,
      scheduledCancelHours: 24,
      deliverySlots: [
        {
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "22:00",
          maxOrdersPerHour: 5,
        },
      ],
      deliveryZones: [
        { name: "Zona 1", maxDistance: 5, deliveryFee: 2, minOrder: 10 },
      ],
    },
  });

  const acceptsTransfer = watch("acceptsTransfer") ?? false;
  const deliverySlots = watch("deliverySlots");
  const deliveryZones = watch("deliveryZones");

  const onSubmit = (data: RegisterInput) => {
    registerUser(data);
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const addDeliverySlot = () => {
    setValue("deliverySlots", [
      ...deliverySlots,
      {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "22:00",
        maxOrdersPerHour: 5,
      },
    ]);
  };

  const removeDeliverySlot = (index: number) => {
    if (deliverySlots.length > 1) {
      setValue(
        "deliverySlots",
        deliverySlots.filter((_, i) => i !== index)
      );
    }
  };

  const addDeliveryZone = () => {
    setValue("deliveryZones", [
      ...deliveryZones,
      { name: "", maxDistance: 5, deliveryFee: 2, minOrder: 10 },
    ]);
  };

  const removeDeliveryZone = (index: number) => {
    if (deliveryZones.length > 1) {
      setValue(
        "deliveryZones",
        deliveryZones.filter((_, i) => i !== index)
      );
    }
  };

  const error = registerError as AxiosError<{ message: string }>;
  const errorMessage = error?.response?.data?.message || error?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Crear Cuenta</CardTitle>
          <CardDescription>
            Paso {currentStep} de 5: {STEPS[currentStep - 1].title}
          </CardDescription>

          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`h-2 flex-1 rounded-full ${
                  step.id <= currentStep ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <Alert variant="error" className="mb-4">
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Datos Personales */}
            {currentStep === 1 && (
              <>
                <Input
                  label="Nombre completo"
                  placeholder="Juan Pérez"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <Input
                  label="Teléfono"
                  placeholder="+34 612 345 678"
                  error={errors.phone?.message}
                  {...register("phone")}
                />
              </>
            )}

            {/* Step 2: Datos de la Tienda */}
            {currentStep === 2 && (
              <>
                <Input
                  label="Nombre de la tienda"
                  placeholder="Pizzería Don Juan"
                  error={errors.storeName?.message}
                  {...register("storeName")}
                />
                <Input
                  label="Dirección"
                  placeholder="Calle Mayor 123, Madrid"
                  error={errors.storeAddress?.message}
                  {...register("storeAddress")}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Latitud"
                    type="number"
                    step="any"
                    placeholder="40.4168"
                    error={errors.storeLatitude?.message}
                    {...register("storeLatitude", { valueAsNumber: true })}
                  />
                  <Input
                    label="Longitud"
                    type="number"
                    step="any"
                    placeholder="-3.7038"
                    error={errors.storeLongitude?.message}
                    {...register("storeLongitude", { valueAsNumber: true })}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  💡 Puedes obtener las coordenadas desde Google Maps haciendo
                  clic derecho en tu ubicación.
                </p>
                <Input
                  label="Teléfono de la tienda"
                  placeholder="+34 612 345 678"
                  error={errors.storePhone?.message}
                  {...register("storePhone")}
                />
                <Input
                  label="URL del logo"
                  placeholder="https://ejemplo.com/logo.png"
                  error={errors.storeLogo?.message}
                  {...register("storeLogo")}
                />
                <Select
                  label="Moneda"
                  options={[
                    { value: "EUR", label: "Euro (€)" },
                    { value: "ARS", label: "Peso Argentino ($)" },
                  ]}
                  error={errors.currency?.message}
                  {...register("currency")}
                />
              </>
            )}

            {/* Step 3: Configuración de Pagos */}
            {currentStep === 3 && (
              <>
                <Checkbox
                  label="Acepta pago en efectivo"
                  {...register("acceptsCash")}
                />
                <Checkbox
                  label="Acepta pago por transferencia"
                  {...register("acceptsTransfer")}
                />

                {acceptsTransfer && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <Input
                      label="Nombre del banco"
                      placeholder="Santander"
                      error={errors.bankName?.message}
                      {...register("bankName")}
                    />
                    <Input
                      label="Titular de la cuenta"
                      placeholder="Juan Pérez"
                      error={errors.bankAccountHolder?.message}
                      {...register("bankAccountHolder")}
                    />
                    <Input
                      label="Número de cuenta (IBAN)"
                      placeholder="ES12 3456 7890 1234 5678 9012"
                      error={errors.bankAccountNumber?.message}
                      {...register("bankAccountNumber")}
                    />
                    <Input
                      label="Alias (opcional)"
                      placeholder="mi.tienda"
                      error={errors.bankAlias?.message}
                      {...register("bankAlias")}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Anticipación mínima (horas)"
                    type="number"
                    error={errors.minAdvanceHours?.message}
                    {...register("minAdvanceHours", { valueAsNumber: true })}
                  />
                  <Input
                    label="Anticipación máxima (días)"
                    type="number"
                    error={errors.maxAdvanceDays?.message}
                    {...register("maxAdvanceDays", { valueAsNumber: true })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Cancelación inmediata (min)"
                    type="number"
                    error={errors.immediateCancelMinutes?.message}
                    {...register("immediateCancelMinutes", {
                      valueAsNumber: true,
                    })}
                  />
                  <Input
                    label="Cancelación programada (horas)"
                    type="number"
                    error={errors.scheduledCancelHours?.message}
                    {...register("scheduledCancelHours", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </>
            )}

            {/* Step 4: Horarios de Entrega */}
            {currentStep === 4 && (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Define los horarios en los que tu tienda puede recibir
                  pedidos.
                </p>

                {deliverySlots.map((_, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Franja {index + 1}</span>
                      {deliverySlots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDeliverySlot(index)}
                          className="text-red-500 text-sm hover:underline"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <Select
                      label="Día de la semana"
                      options={DAYS.map((d) => ({
                        value: d.value.toString(),
                        label: d.label,
                      }))}
                      {...register(`deliverySlots.${index}.dayOfWeek`, {
                        valueAsNumber: true,
                      })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Hora inicio"
                        type="time"
                        {...register(`deliverySlots.${index}.startTime`)}
                      />
                      <Input
                        label="Hora fin"
                        type="time"
                        {...register(`deliverySlots.${index}.endTime`)}
                      />
                    </div>

                    <Input
                      label="Pedidos máximos por hora"
                      type="number"
                      {...register(`deliverySlots.${index}.maxOrdersPerHour`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  onClick={addDeliverySlot}
                  className="w-full"
                >
                  + Agregar franja horaria
                </Button>
              </>
            )}

            {/* Step 5: Zona de Entrega */}
            {currentStep === 5 && (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Define las zonas de entrega y sus tarifas.
                </p>

                {deliveryZones.map((_, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Zona {index + 1}</span>
                      {deliveryZones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDeliveryZone(index)}
                          className="text-red-500 text-sm hover:underline"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <Input
                      label="Nombre de la zona"
                      placeholder="Centro, Zona Norte, etc."
                      {...register(`deliveryZones.${index}.name`)}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="Distancia máx (km)"
                        type="number"
                        step="0.1"
                        {...register(`deliveryZones.${index}.maxDistance`, {
                          valueAsNumber: true,
                        })}
                      />
                      <Input
                        label="Costo envío"
                        type="number"
                        step="0.01"
                        {...register(`deliveryZones.${index}.deliveryFee`, {
                          valueAsNumber: true,
                        })}
                      />
                      <Input
                        label="Pedido mínimo"
                        type="number"
                        step="0.01"
                        {...register(`deliveryZones.${index}.minOrder`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  onClick={addDeliveryZone}
                  className="w-full"
                >
                  + Agregar zona de entrega
                </Button>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  className="flex-1"
                >
                  Anterior
                </Button>
              )}

              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep} className="flex-1">
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isRegistering}
                >
                  Crear Cuenta
                </Button>
              )}
            </div>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
