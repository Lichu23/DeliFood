"use client";

import { useState } from "react";
import { PublicStore } from "@/types/store.types";
import { CategoryTabs } from "./CategoryTabs";
import { ProductCard } from "./ProductCard";
import { ProductDetailModal } from "./ProductDetailModal";
import { FloatingCartButton } from "./FloatingCartButton";
import { Product } from "@/types/product.types";

interface ProductCatalogProps {
  store: PublicStore;
  onOpenCart?: () => void; // Add this prop
}

export function ProductCatalog({ store, onOpenCart }: ProductCatalogProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter products by selected category and only show available products
  const filteredProducts = store.products.filter((product) => {
    if (!product.isAvailable) return false;
    if (!selectedCategoryId) return true;
    return product.categoryId === selectedCategoryId;
  });

  // Group products by category for display
  const productsByCategory = store.categories.map((category) => ({
    category,
    products: filteredProducts.filter((p) => p.categoryId === category.id),
  }));

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Tabs */}
        <CategoryTabs
          categories={store.categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        {/* Products Grid */}
        <div className="mt-6">
          {selectedCategoryId ? (
            // Show products for selected category
            <div>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      store={store}
                      onProductClick={setSelectedProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    No hay productos disponibles en esta categoría.
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Show all products grouped by category
            <div className="space-y-8">
              {productsByCategory.map(
                ({ category, products }) =>
                  products.length > 0 && (
                    <div key={category.id}>
                      <h2 className="text-2xl font-bold mb-4">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-gray-600 mb-4">
                          {category.description}
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            store={store}
                            onProductClick={setSelectedProduct}
                          />
                        ))}
                      </div>
                    </div>
                  )
              )}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    No hay productos disponibles en este momento.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          store={store}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Floating Cart Button (optional) */}
      {onOpenCart && <FloatingCartButton onOpen={onOpenCart} />}
    </>
  );
}
