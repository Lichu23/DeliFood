  "use client";

  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { deliveryAddressSchema } from "@/schemas/checkout.schema";
  import { DeliveryAddress } from "@/types/checkout.types";
  import { PublicStore } from "@/types/store.types";
  import { Input } from "@/components/ui/Input";
  import { Button } from "@/components/ui/Button";

  interface DeliveryAddressStepProps {
    initialData?: DeliveryAddress;
    store: PublicStore;
    onNext: (data: { deliveryAddress: DeliveryAddress }) => void;
    onBack: () => void;
  }

  export function DeliveryAddressStep({
    initialData,
    store,
    onNext,
    onBack,
  }: DeliveryAddressStepProps) {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<DeliveryAddress>({
      resolver: zodResolver(deliveryAddressSchema),
      defaultValues: initialData,
    });

    const onSubmit = (data: DeliveryAddress) => {
      onNext({ deliveryAddress: data });
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Dirección de entrega</h2>

        <Input
          label="Dirección completa"
          {...register("address")}
          error={errors.address?.message}
          placeholder="Calle, número, piso, puerta..."
          required
        />

        <Input
          label="Ciudad"
          {...register("city")}
          error={errors.city?.message}
          placeholder="Madrid"
          required
        />

        <Input
          label="Código postal (opcional)"
          {...register("postalCode")}
          error={errors.postalCode?.message}
          placeholder="28001"
        />

        {/* Zone Selection - Using native select instead of custom Select component */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zona de entrega <span className="text-red-600">*</span>
          </label>
          <select
            {...register("zoneId")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${     
              errors.zoneId ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Selecciona una zona</option>
            {store.deliveryZones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} - {store.currency === "EUR" ? "€" : "$"}
                {zone.deliveryFee.toFixed(2)} (Mínimo:{" "}
                {store.currency === "EUR" ? "€" : "$"}
                {zone.minimumOrder.toFixed(2)})
              </option>
            ))}
          </select>
          {errors.zoneId && (
            <p className="text-red-600 text-sm mt-1">{errors.zoneId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas de entrega (opcional)
          </label>
          <textarea
            {...register("notes")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Ej: Llamar al timbre, dejar en portería..."
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onBack}>
            Atrás
          </Button>
          <Button type="submit" className="flex-1">
            Continuar
          </Button>
        </div>
      </form>
    );
  }