  "use client";

  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { customerInfoSchema } from "@/schemas/checkout.schema";
  import { CustomerInfo } from "@/types/checkout.types";
  import { Input } from "@/components/ui/Input";
  import { Button } from "@/components/ui/Button";

  interface CustomerInfoStepProps {
    initialData?: CustomerInfo;
    onNext: (data: { customerInfo: CustomerInfo }) => void;
  }

  export function CustomerInfoStep({ initialData, onNext }: CustomerInfoStepProps) {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<CustomerInfo>({
      resolver: zodResolver(customerInfoSchema),
      defaultValues: initialData,
    });

    const onSubmit = (data: CustomerInfo) => {
      onNext({ customerInfo: data });
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Datos personales</h2>

        <Input
          label="Nombre completo"
          {...register("name")}
          error={errors.name?.message}
          placeholder="Juan Pérez"
          required
        />

        <Input
          label="Teléfono"
          {...register("phone")}
          error={errors.phone?.message}
          placeholder="+34 600 000 000"
          type="tel"
          required
        />

        <Input
          label="Email (opcional)"
          {...register("email")}
          error={errors.email?.message}
          placeholder="juan@example.com"
          type="email"
        />

        <Button type="submit" className="w-full">
          Continuar
        </Button>
      </form>
    );
  }