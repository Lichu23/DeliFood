  import { publicOrdersService } from "@/services/public-orders.service";
  import { OrderTracking } from "@/components/public/OrderTracking";
  import { Metadata } from "next";
  import { notFound } from "next/navigation";

  interface TrackPageProps {
    params: Promise<{
      orderId: string;
    }>;
  }

  export async function generateMetadata({
    params,
  }: TrackPageProps): Promise<Metadata> {
    return {
      title: `Seguimiento de pedido - DeliFood`,
      description: "Rastrea tu pedido en tiempo real",
    };
  }

  export default async function TrackPage({ params }: TrackPageProps) {
    const { orderId } = await params; // ✅ Await params first
    let order;

    try {
      order = await publicOrdersService.trackOrder(orderId);
    } catch (error) {
      notFound();
    }

    return <OrderTracking order={order} />;
  }