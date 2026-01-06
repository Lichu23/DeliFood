  'use client';

  import { Category } from '@/types/category.types';
  import { Button } from '@/components/ui/Button';
  import { Card } from '@/components/ui/Card';
  import { Edit, Trash2, FolderOpen, GripVertical } from 'lucide-react';
  import { useSortable } from '@dnd-kit/sortable';
  import { CSS } from '@dnd-kit/utilities';

  interface CategoryCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (categoryId: string) => void;
  }

  export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style}>
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-6">
            {/* Drag Handle */}
            <div className="flex items-start gap-3 mb-3">
              <button
                className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 -ml-1"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-5 h-5" />
              </button>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 ml-8">
              {category._count && (
                <div>
                  <span className="font-medium">{category._count.products}</span>{' '}
                  producto(s)
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t ml-8">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(category)}
                className="flex-1 gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(category.id)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }