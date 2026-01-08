"use client";

import { useCart } from "@/hooks/useCart";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

interface FloatingCartButtonProps {
  onOpen: () => void;
}

export function FloatingCartButton({ onOpen }: FloatingCartButtonProps) {
  const { itemCount, summary, formatPrice } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  // Show button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (itemCount === 0) return null;

  return (
    <button
      onClick={onOpen}
      className={`fixed bottom-6 right-6 z-30 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 flex items-center gap-3 transition-all ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
    >
      <div className="relative">
        <ShoppingCart className="w-5 h-5" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      </div>
      <div className="text-left hidden sm:block">
        <p className="text-xs opacity-90">Ver carrito</p>
        <p className="font-bold">{formatPrice(summary.total)}</p>
      </div>
    </button>
  );
}
