  'use client';

  import { Category } from '@/types/category.types';
  import { Select } from '@/components/ui/Select';
  import { Input } from '@/components/ui/Input';
  import { Search, X } from 'lucide-react';
  import { Button } from '@/components/ui/Button';

  interface ProductFiltersProps {
    categories: Category[];
    selectedCategoryId: string;
    searchQuery: string;
    onCategoryChange: (categoryId: string) => void;
    onSearchChange: (query: string) => void;
  }

  export function ProductFilters({
    categories,
    selectedCategoryId,
    searchQuery,
    onCategoryChange,
    onSearchChange,
  }: ProductFiltersProps) {
    const hasActiveFilters = selectedCategoryId || searchQuery;

    const handleClearFilters = () => {
      onCategoryChange('');
      onSearchChange('');
    };

    const categoryOptions = [
      { value: '', label: 'Todas las categorías' },
      ...categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    ];

    return (
      <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Filtros</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-500"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <Select
              value={selectedCategoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              options={categoryOptions}
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Nombre o descripción..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }