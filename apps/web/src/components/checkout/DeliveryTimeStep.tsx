"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deliveryTimeSchema } from "@/schemas/checkout.schema";
import { DeliveryTime, AvailableSlot } from "@/types/checkout.types";
import { PublicStore } from "@/types/store.types";
import { publicOrdersService } from "@/services/public-orders.service";
import { Button } from "@/components/ui/Button";
import { Clock, Calendar } from "lucide-react";

interface DeliveryTimeStepProps {
  initialData?: DeliveryTime;
  store: PublicStore;
  onNext: (data: { deliveryTime: DeliveryTime }) => void;
  onBack: () => void;
}

export function DeliveryTimeStep({
  initialData,
  store,
  onNext,
  onBack,
}: DeliveryTimeStepProps) {
  const [deliveryType, setDeliveryType] = useState<"IMMEDIATE" | "SCHEDULED">(
    initialData?.type || "IMMEDIATE"
  );
  const [selectedDate, setSelectedDate] = useState(
    initialData?.scheduledDate || ""
  );
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DeliveryTime>({
    resolver: zodResolver(deliveryTimeSchema),
    defaultValues: initialData,
  });

  // Load available slots when date changes
  useEffect(() => {
    if (deliveryType === "SCHEDULED" && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate, deliveryType]);

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const slots = await publicOrdersService.getAvailableSlots(
        store.id,
        selectedDate
      );
      setAvailableSlots(slots);
    } catch (err) {
      console.error("Error loading slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const onSubmit = (data: DeliveryTime) => {
    onNext({ deliveryTime: data });
  };

  // Generate next 7 days for date picker
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      });
    }
    return dates;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Horario de entrega</h2>

      {/* Delivery Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setDeliveryType("IMMEDIATE");
            setValue("type", "IMMEDIATE");
          }}
          className={`p-4 border-2 rounded-lg flex items-center gap-3 ${
            deliveryType === "IMMEDIATE"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-300"
          }`}
        >
          <Clock className="w-6 h-6" />
          <div className="text-left">
            <p className="font-semibold">Entrega inmediata</p>
            <p className="text-sm text-gray-600">Lo antes posible</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setDeliveryType("SCHEDULED");
            setValue("type", "SCHEDULED");
          }}
          className={`p-4 border-2 rounded-lg flex items-center gap-3 ${
            deliveryType === "SCHEDULED"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-300"
          }`}
        >
          <Calendar className="w-6 h-6" />
          <div className="text-left">
            <p className="font-semibold">Programar entrega</p>
            <p className="text-sm text-gray-600">Elige fecha y hora</p>
          </div>
        </button>
      </div>

      <input type="hidden" {...register("type")} />

      {/* Scheduled Delivery Options */}
      {deliveryType === "SCHEDULED" && (
        <div className="space-y-4">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de entrega
            </label>
            <select
              {...register("scheduledDate")}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una fecha</option>
              {generateDateOptions().map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
            {errors.scheduledDate && (
              <p className="text-red-600 text-sm mt-1">
                {errors.scheduledDate.message}
              </p>
            )}
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario de entrega
              </label>
              {loadingSlots ? (
                <p className="text-gray-600">
                  Cargando horarios disponibles...
                </p>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <label
                      key={slot.slot.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer text-center ${
                        !slot.available
                          ? "opacity-50 cursor-not-allowed bg-gray-100"
                          : "hover:border-blue-600"
                      }`}
                    >
                      <input
                        type="radio"
                        {...register("scheduledTimeSlot")}
                        value={slot.slot.id}
                        disabled={!slot.available}
                        className="sr-only"
                      />
                      <p className="font-semibold">
                        {slot.slot.startTime} - {slot.slot.endTime}
                      </p>
                      {!slot.available && (
                        <p className="text-xs text-red-600">No disponible</p>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No hay horarios disponibles para esta fecha
                </p>
              )}
              {errors.scheduledTimeSlot && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.scheduledTimeSlot.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

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
