  "use client";

  import { useEffect } from "react";
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
  import { useRouter } from "next/navigation";
  import { productsService } from "@/services/products.service";
  import { categoriesService } from "@/services/categories.service";
  import { useAuth } from "@/hooks/useAuth";
  import { Product } from "@/types/product.types";
  import {
    createProductSchema,
    updateProductSchema,
    CreateProductFormData,
    UpdateProductFormData,
  } from "@/schemas/product.schema";
  import { Button } from "@/components/ui/Button";
  import { Input } from "@/components/ui/Input";
  import { Select } from "@/components/ui/Select";
  import { Card } from "@/components/ui/Card";
  import { ImageUploadBasic } from "./ImageUploadBasic";
  import { ArrowLeft, Loader2 } from "lucide-react";

  interface ProductFormProps {
    product?: Product;
  }

  type ProductFormData = CreateProductFormData | UpdateProductFormData;

  export function ProductForm({ product }: ProductFormProps) {
    const { currentStore } = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter();
    const isEditing = !!product;

    // Fetch categories for dropdown
    const { data: categories, isLoading: isLoadingCategories } = useQuery({
      queryKey: ["categories", currentStore?.id],
      queryFn: () => categoriesService.list(currentStore!.id),
      enabled: !!currentStore,
    });

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
      setValue,
      watch,
    } = useForm<ProductFormData>({
      resolver: zodResolver(
        isEditing ? updateProductSchema : createProductSchema
      ),
      defaultValues: {
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price || 0,
        imageUrl: product?.imageUrl || "",
        isAvailable: product?.isAvailable ?? true,
        categoryId: product?.categoryId || "",
      },
    });

    // Watch imageUrl for preview
    const imageUrl = watch("imageUrl");

    // Reset form when product changes
    useEffect(() => {
      if (product) {
        reset({
          name: product.name,
          description: product.description || "",
          price: product.price,
          imageUrl: product.imageUrl || "",
          isAvailable: product.isAvailable,
          categoryId: product.categoryId,
        });
      }
    }, [product, reset]);

    // Create mutation
    const createMutation = useMutation({
      mutationFn: (data: CreateProductFormData) =>
        productsService.create(currentStore!.id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        router.push("/products");
      },
    });

    // Update mutation
    const updateMutation = useMutation({
      mutationFn: (data: UpdateProductFormData) =>
        productsService.update(currentStore!.id, product!.id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        router.push("/products");
      },
    });

    // Delete mutation
    const deleteMutation = useMutation({
      mutationFn: () => productsService.delete(currentStore!.id, product!.id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        router.push("/products");
      },
    });

    const onSubmit = async (data: ProductFormData) => {
      try {
        if (isEditing) {
          // Update → data can be partial
          await updateMutation.mutateAsync(data);
        } else {
          // Create → we know it's full because create schema was used
          await createMutation.mutateAsync(data as CreateProductFormData);
        }
      } catch (error) {
        console.error("Error saving product:", error);
        alert("Error al guardar el producto");
      }
    };

    const handleDelete = async () => {
      if (window.confirm("¿Estás seguro de eliminar este producto?")) {
        try {
          await deleteMutation.mutateAsync();
        } catch (error) {
          console.error("Error deleting product:", error);
          alert("Error al eliminar el producto");
        }
      }
    };

    const handleImageUpload = (url: string) => {
      setValue("imageUrl", url);
    };

    if (!currentStore) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay tienda seleccionada</p>
        </div>
      );
    }

    if (isLoadingCategories) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }

    const categoryOptions = [
      { value: "", label: "Selecciona una categoría" },
      ...(categories || []).map((category) => ({
        value: category.id,
        label: category.name,
      })),
    ];

    return (
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/products")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {isEditing ? "Editar producto" : "Nuevo producto"}
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? "Actualiza la información del producto"
                : "Completa los datos del nuevo producto"}
            </p>
          </div>
          {isEditing && (
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Info */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Información básica</h2>

              {/* Name */}
              <div>
                <Input
                  label="Nombre del producto"
                  {...register("name")}
                  error={errors.name?.message}
                  placeholder="Ej: Pizza Margarita, Coca-Cola 500ml"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción del producto (opcional)"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <Input
                    label="Precio (€)"
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                    error={errors.price?.message}
                    placeholder="0.00"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <Select {...register("categoryId")} options={categoryOptions} />
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  {...register("isAvailable")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isAvailable"
                  className="text-sm font-medium text-gray-700"
                >
                  Producto disponible
                </label>
              </div>
            </div>
          </Card>

          {/* Image */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Imagen del producto</h2>
              <ImageUploadBasic
                imageUrl={imageUrl as string}
                onImageUpload={handleImageUpload}
              />
              <input type="hidden" {...register("imageUrl")} />
              {errors.imageUrl && (
                <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/products")}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Guardando..."
                : isEditing
                ? "Actualizar producto"
                : "Crear producto"}
            </Button>
          </div>
        </form>
      </div>
    );
  }