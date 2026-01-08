  'use client';

  import { Product } from '@/types/product.types';
  import { Card } from '@/components/ui/Card';
  import { AvailabilityToggle } from './AvailabilityToggle';
  import { Edit, Trash2, ImageIcon } from 'lucide-react';

  interface ProductCardProps {
    product: Product;
    onToggleAvailability: (productId: string) => void;
    onEdit: (productId: string) => void;
    onDelete: (productId: string) => void;
  }

  export function ProductCard({
    product,
    onToggleAvailability,
    onEdit,
    onDelete,
  }: ProductCardProps) {
    const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Edit clicked for product:', product.id);
      onEdit(product.id);
    };

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Delete clicked for product:', product.id);
      onDelete(product.id);
    };

    const handleToggle = () => {
      console.log('Toggle availability for product:', product.id);
      onToggleAvailability(product.id);
    };

    return (
      <Card className="hover:shadow-md transition-shadow overflow-hidden">
        {/* Image */}
        <div className="relative h-48 bg-gray-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover ${
                !product.isAvailable ? 'opacity-50 grayscale' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                No disponible
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title and Category */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
            {product.category && (
              <p className="text-xs text-gray-500 mt-1">
                {product.category.name}
              </p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price and Availability */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xl font-bold text-blue-600">
              €{product.price.toFixed(2)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">
                {product.isAvailable ? 'Disponible' : 'No disponible'}
              </span>
              <AvailabilityToggle
                available={product.isAvailable}
                onChange={handleToggle}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleEdit}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    );
  }