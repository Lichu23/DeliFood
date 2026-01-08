"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { publicStoreService } from "@/services/public-store.service";
import { publicOrdersService } from "@/services/public-orders.service";
import { PublicStore } from "@/types/store.types";
import {
  CheckoutData,
  CustomerInfo,
  DeliveryAddress,
  DeliveryTime,
} from "@/types/checkout.types";
import { CustomerInfoStep } from "@/components/checkout/CustomerInfoStep";
import { DeliveryAddressStep } from "@/components/checkout/DeliveryAddressStep";
import { DeliveryTimeStep } from "@/components/checkout/DeliveryTimeStep";
import { PaymentMethodStep } from "@/components/checkout/PaymentMethodStep";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ArrowLeft } from "lucide-react";

type CheckoutStep =
  | { customerInfo: CustomerInfo }
  | { deliveryAddress: DeliveryAddress }
  | { deliveryTime: DeliveryTime }
  | { paymentMethod: "CASH" | "TRANSFER" };


export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams(); // ✅ Use hook instead of prop
  const slug = params.slug as string; // ✅ Get slug from params
  const { cart, isEmpty, clearCart } = useCart();
  const [store, setStore] = useState<PublicStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({});

  // Load store data
  useEffect(() => {
    async function loadStore() {
      try {
        const storeData = await publicStoreService.getBySlug(slug);
        setStore(storeData);
      } catch (err) {
        setError("No se pudo cargar la tienda");
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [slug]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && isEmpty) {
      router.push(`/store/${slug}`);
    }
  }, [isEmpty, loading, router, slug]);

  const handleNextStep = (stepData: CheckoutStep) => {
    setCheckoutData((prev) => ({ ...prev, ...stepData }));
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmitOrder = async (paymentData: {
    paymentMethod: "CASH" | "TRANSFER";
  }) => {
    if (!cart || !store) return;

    setSubmitting(true);
    setError(null);

    try {
      const finalData = { ...checkoutData, ...paymentData } as CheckoutData;

      // Prepare order data
      const orderData = {
        items: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        customerName: finalData.customerInfo.name,
        customerPhone: finalData.customerInfo.phone,
        customerEmail: finalData.customerInfo.email,
        deliveryAddress: finalData.deliveryAddress.address,
        deliveryCity: finalData.deliveryAddress.city,
        deliveryPostalCode: finalData.deliveryAddress.postalCode,
        deliveryNotes: finalData.deliveryAddress.notes,
        deliveryZoneId: finalData.deliveryAddress.zoneId,
        orderType: finalData.deliveryTime.type,
        scheduledDate: finalData.deliveryTime.scheduledDate,
        scheduledTimeSlot: finalData.deliveryTime.scheduledTimeSlot,
        paymentMethod: finalData.paymentMethod,
      };

      // Submit order
      const order = await publicOrdersService.create(slug, orderData);
      // Clear cart
      clearCart();

      // Redirect to confirmation page
      router.push(`/store/${slug}/order/${order.id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear el pedido";
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!store || isEmpty) {
    return null;
  }

  const steps = [
    { number: 1, title: "Datos personales" },
    { number: 2, title: "Dirección de entrega" },
    { number: 3, title: "Horario de entrega" },
    { number: 4, title: "Método de pago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push(`/store/${slug}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a la tienda
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.number
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              {currentStep === 1 && (
                <CustomerInfoStep
                  initialData={checkoutData.customerInfo}
                  onNext={handleNextStep}
                />
              )}

              {currentStep === 2 && (
                <DeliveryAddressStep
                  initialData={checkoutData.deliveryAddress}
                  store={store}
                  onNext={handleNextStep}
                  onBack={handlePrevStep}
                />
              )}

              {currentStep === 3 && (
                <DeliveryTimeStep
                  initialData={checkoutData.deliveryTime}
                  store={store}
                  onNext={handleNextStep}
                  onBack={handlePrevStep}
                />
              )}

              {currentStep === 4 && (
                <PaymentMethodStep
                  initialData={{ paymentMethod: checkoutData.paymentMethod }}
                  store={store}
                  onSubmit={handleSubmitOrder}
                  onBack={handlePrevStep}
                  submitting={submitting}
                />
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary store={store} />
          </div>
        </div>
      </div>
    </div>
  );
}
