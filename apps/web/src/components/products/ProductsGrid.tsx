  'use client';

  import { useState } from 'react';
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { productsService } from '@/services/products.service';
  import { categoriesService } from '@/services/categories.service';
  import { useAuth } from '@/hooks/useAuth';
  import { ProductCard } from './ProductCard';
  import { ProductFilters } from './ProductFilters';
  import { Button } from '@/components/ui/Button';
  import { Loader2, Package, Plus } from 'lucide-react';
  import { useRouter } from 'next/navigation';

  export function ProductsGrid() {
    const { currentStore } = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch products
    const {
      data: products,
      isLoading: isLoadingProducts,
      isError,
      error,
    } = useQuery({
      queryKey: ['products', currentStore?.id],
      queryFn: () => productsService.list(currentStore!.id),
      enabled: !!currentStore,
    });


    console.log('Products:', products?.length, products?.map(product => ({ id: product.id, available: product.isAvailable })));

    // Fetch categories for filter
    const { data: categories, isLoading: isLoadingCategories } = useQuery({
      queryKey: ['categories', currentStore?.id],
      queryFn: () => categoriesService.list(currentStore!.id),
      enabled: !!currentStore,
    });

    // Toggle availability mutation
    const toggleAvailabilityMutation = useMutation({
      mutationFn: ({ productId }: { productId: string }) =>
        productsService.toggleAvailability(currentStore!.id, productId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
    });

    // Delete mutation
    const deleteMutation = useMutation({
      mutationFn: (productId: string) =>
        productsService.delete(currentStore!.id, productId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
    });

    const handleToggleAvailability = async (productId: string) => {
      try {
        await toggleAvailabilityMutation.mutateAsync({ productId });
      } catch (error) {
        console.error('Error toggling availability:', error);
        alert('Error al cambiar disponibilidad');
      }
    };

    const handleEdit = (productId: string) => {
      router.push(`/products/${productId}/edit`);
    };

    const handleDelete = async (productId: string) => {
      if (window.confirm('¿Estás seguro de eliminar este producto?')) {
        try {
          await deleteMutation.mutateAsync(productId);
        } catch (error) {
          console.error('Error deleting product:', error);
          alert('Error al eliminar el producto');
        }
      }
    };

    // Filter products
    const filteredProducts = products?.filter((product) => {
      // Filter by category
      if (selectedCategoryId && product.categoryId !== selectedCategoryId) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDescription = product.description?.toLowerCase().includes(query);
        return matchesName || matchesDescription;
      }

      return true;
    });

    if (!currentStore) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay tienda seleccionada</p>
        </div>
      );
    }

    const isLoading = isLoadingProducts || isLoadingCategories;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500">
            Error al cargar productos:{' '}
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Productos</h1>
            <p className="text-gray-600">
              {filteredProducts?.length || 0} producto(s)
              {(selectedCategoryId || searchQuery) && ' (filtrados)'}
            </p>
          </div>
          <Button
            onClick={() => router.push('/products/new')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo producto
          </Button>
        </div>

        {/* Filters */}
        <ProductFilters
          categories={categories || []}
          selectedCategoryId={selectedCategoryId}
          searchQuery={searchQuery}
          onCategoryChange={setSelectedCategoryId}
          onSearchChange={setSearchQuery}
        />

        {/* Empty State */}
        {filteredProducts && filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchQuery || selectedCategoryId
                ? 'No se encontraron productos'
                : 'No hay productos'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategoryId
                ? 'Intenta ajustar los filtros'
                : 'Comienza agregando tu primer producto'}
            </p>
            {!searchQuery && !selectedCategoryId && (
              <Button
                onClick={() => router.push('/products/new')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Crear producto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleAvailability={handleToggleAvailability}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    );
  }