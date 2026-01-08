  import { StoreHeader } from "@/components/public/StoreHeader";
  import { ProductCatalog } from "@/components/public/ProductCatalog";
  import { publicStoreService } from "@/services/public-store.service";
  import { Metadata } from "next";
  import { notFound } from "next/navigation";

  interface StorePageProps {
    params: Promise<{
      slug: string;
    }>;
  }

  // Generate metadata for SEO
  export async function generateMetadata({
    params,
  }: StorePageProps): Promise<Metadata> {
    const { slug } = await params; // ✅ Await params first

    try {
      const store = await publicStoreService.getBySlug(slug);
      return {
        title: `${store.name} - DeliFood`,
        description: store.description || `Ordena desde ${store.name}`,
      };
    } catch (error) {
      return {
        title: "Tienda no encontrada - DeliFood",
      };
    }
  }

  export default async function StorePage({ params }: StorePageProps) {
    const { slug } = await params; // ✅ Await params first
    let store;

    try {
      store = await publicStoreService.getBySlug(slug);
    } catch (error) {
      // Let Next.js handle 404
      notFound();
    }

    // Check if store is active
    if (!store.isActive) {
      return <StoreInactive />;
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <StoreHeader store={store} />
        <ProductCatalog store={store} />
      </div>
    );
  }

  // Separate component for inactive store
  function StoreInactive() {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Tienda no disponible</h1>
          <p className="text-gray-600">
            Esta tienda no está activa en este momento.
          </p>
        </div>
      </div>
    );
  }