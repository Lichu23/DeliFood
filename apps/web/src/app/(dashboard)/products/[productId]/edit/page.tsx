  'use client';

  import { useParams } from 'next/navigation';
  import { useQuery } from '@tanstack/react-query';
  import { productsService } from '@/services/products.service';
  import { useAuth } from '@/hooks/useAuth';
  import { ProductForm } from '@/components/products/ProductForm';
  import { Loader2 } from 'lucide-react';

  export default function EditProductPage() {
    const params = useParams();
    const { currentStore } = useAuth();
    const productId = params.productId as string;

    const {
      data: product,
      isLoading,
      isError,
    } = useQuery({
      queryKey: ['product', productId],
      queryFn: () => productsService.getById(currentStore!.id, productId),
      enabled: !!currentStore && !!productId,
    });

    if (!currentStore) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay tienda seleccionada</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }

    if (isError || !product) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500">Error al cargar el producto</p>
        </div>
      );
    }

    return <ProductForm product={product} />;
  }