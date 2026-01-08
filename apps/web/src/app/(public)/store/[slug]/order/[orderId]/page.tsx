  import { publicOrdersService } from "@/services/public-orders.service";
  import { OrderConfirmation } from "@/components/public/OrderConfirmation";
  import { Metadata } from "next";
  import { notFound } from "next/navigation";

  interface OrderPageProps {
    params: Promise<{
      slug: string;
      orderId: string;
    }>;
  }

  export async function generateMetadata({
    params,
  }: OrderPageProps): Promise<Metadata> {
    const { orderId } = await params; // ✅ Await params first

    return {
      title: `Pedido #${orderId.slice(0, 8)} - DeliFood`,
      description: "Detalles de tu pedido",
    };
  }

  export default async function OrderPage({ params }: OrderPageProps) {
    const { slug, orderId } = await params; // ✅ Await params first
    let order;

    try {
      order = await publicOrdersService.getOrderById(orderId);
    } catch (error) {
      notFound();
    }

    // Verify order belongs to the store
    if (order.store.slug !== slug) {
      notFound();
    }

    return <OrderConfirmation order={order} />;
  }