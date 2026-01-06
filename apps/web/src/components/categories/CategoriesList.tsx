
  'use client';

  import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { categoriesService } from '@/services/categories.service';
import { Category } from '@/types/category.types';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderOpen, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { CategoryCard } from './CategoryCard';
import { CategoryFormDialog } from './CategoryFormDialog';

  export function CategoriesList() {
    const { currentStore } = useAuth();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Fetch categories
    const {
      data: categories,
      isLoading,
      isError,
      error,
    } = useQuery({
      queryKey: ['categories', currentStore?.id],
      queryFn: () => categoriesService.list(currentStore!.id),
      enabled: !!currentStore,
    });

    // Use categories directly, no local state needed until drag
    const displayCategories = categories || [];

    // Setup drag and drop sensors
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    // Update sort order mutation
    const updateSortOrderMutation = useMutation({
      mutationFn: (categories: { id: string; sortOrder: number }[]) =>
        categoriesService.updateSortOrder(currentStore!.id, categories),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      },
    });

    // Delete mutation
    const deleteMutation = useMutation({
      mutationFn: (categoryId: string) =>
        categoriesService.delete(currentStore!.id, categoryId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      },
    });

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const items = [...displayCategories];
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      // Update sortOrder for all items
      const updatedItems = newItems.map((item, index) => ({
        id: item.id,
        sortOrder: index,
      }));

      // Optimistically update the cache
      queryClient.setQueryData(
        ['categories', currentStore?.id],
        newItems
      );

      // Persist to backend
      updateSortOrderMutation.mutate(updatedItems);
    };

    const handleEdit = (category: Category) => {
      setEditingCategory(category);
    };

    const handleDelete = async (categoryId: string) => {
      if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
        try {
          await deleteMutation.mutateAsync(categoryId);
        } catch (error) {
          console.error('Error deleting category:', error);
          alert('Error al eliminar la categoría');
        }
      }
    };

    const handleCloseDialog = () => {
      setIsCreateDialogOpen(false);
      setEditingCategory(null);
    };

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

    if (isError) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500">
            Error al cargar categorías:{' '}
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
            <h1 className="text-2xl font-bold">Categorías</h1>
            <p className="text-gray-600">
              {displayCategories.length} categoría(s) - Arrastra para reordenar
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva categoría
          </Button>
        </div>

        {/* Empty State */}
        {displayCategories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
            <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No hay categorías
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza creando tu primera categoría
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Crear categoría
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayCategories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Create/Edit Dialog */}
        {(isCreateDialogOpen || editingCategory) && (
          <CategoryFormDialog
            category={editingCategory}
            isOpen={isCreateDialogOpen || !!editingCategory}
            onClose={handleCloseDialog}
          />
        )}
      </div>
    );
  }