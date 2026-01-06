"use client";
import { OrderStatus, OrderType, PaymentStatus } from "@/types/order.types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { X } from "lucide-react";

interface OrderFiltersProps {
  filters: FilterValues;
  searchQuery: string;
  dateRange: string;
  onFilterChange: (filters: FilterValues) => void;
  onSearchChange: (search: string) => void;
  onDateRangeChange: (range: string) => void;
}

export interface FilterValues {
  status?: OrderStatus;
  type?: OrderType;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "PREPARING", label: "Preparando" },
  { value: "READY", label: "Listo" },
  { value: "ON_THE_WAY", label: "En camino" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Todos los tipos" },
  { value: "IMMEDIATE", label: "Inmediato" },
  { value: "SCHEDULED", label: "Programado" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "Todos los pagos" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmado" },
];

const DATE_RANGE_OPTIONS = [
  { value: "", label: "Todas las fechas" },
  { value: "today", label: "Hoy" },
  { value: "yesterday", label: "Ayer" },
  { value: "last7days", label: "Últimos 7 días" },
  { value: "last30days", label: "Últimos 30 días" },
];

export function OrderFilters({
  filters,
  searchQuery,
  dateRange,
  onFilterChange,
  onSearchChange,
  onDateRangeChange,
}: OrderFiltersProps) {
  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    let newFilters: FilterValues;

    if (value) {
      // Add or update the filter
      newFilters = { ...filters, [key]: value as FilterValues[typeof key] };
    } else {
      // Remove the filter
      const { [key]: _removed, ...rest } = filters;
      newFilters = rest;
    }

    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({});
    onSearchChange("");
    onDateRangeChange("");
  };

  const hasActiveFilters =
    Object.values(filters).some((value) => value) || searchQuery || dateRange;

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <Select
            value={filters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <Select
            value={filters.type || ""}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            options={TYPE_OPTIONS}
          />
        </div>

        {/* Payment Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado de pago
          </label>
          <Select
            value={filters.paymentStatus || ""}
            onChange={(e) =>
              handleFilterChange("paymentStatus", e.target.value)
            }
            options={PAYMENT_STATUS_OPTIONS}
          />
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rango de fechas
          </label>
          <Select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            options={DATE_RANGE_OPTIONS}
          />
        </div>

        {/* Search - Full width on its own row */}
        <div className="md:col-span-2 lg:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar por nombre
          </label>
          <Input
            type="text"
            placeholder="Nombre del cliente, teléfono, email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
