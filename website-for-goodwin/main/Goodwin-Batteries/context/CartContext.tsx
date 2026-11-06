"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Product, CartItem } from "@/types";
import { getProductPricing } from "@/lib/pricing";

interface PincodeStatus {
  checked: boolean;
  available: boolean;
  city?: string;
  deliveryTime?: string;
  message: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  itemCount: number;
  totalMrp: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  deliveryFee: number;
  pincode: string;
  setPincode: (pin: string) => void;
  pincodeStatus: PincodeStatus | null;
  checkPincode: (pin: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "goodwin_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<PincodeStatus | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        queueMicrotask(() => {
          setItems(parsed);
          setIsLoaded(true);
        });
        return;
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
    queueMicrotask(() => setIsLoaded(true));
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items, isLoaded]);

  const addToCart = (product: Product, quantity = 1) => {
    const pricing = getProductPricing(product);
    
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image || "/assets/logo/Goodwin.png",
        series: product.series,
        ah: product.ah,
        voltage: product.voltage,
        warranty: product.warranty,
        mrp: pricing.mrp,
        price: pricing.price,
        quantity,
      };

      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const checkPincode = (pin: string) => {
    const clean = pin.trim();
    if (!/^\d{6}$/.test(clean)) {
      setPincodeStatus({
        checked: true,
        available: false,
        message: "Please enter a valid 6-digit Indian PIN code.",
      });
      return;
    }

    const firstTwo = clean.slice(0, 2);
    if (firstTwo === "11" || firstTwo === "12" || firstTwo === "20") {
      setPincodeStatus({
        checked: true,
        available: true,
        city: "Delhi NCR",
        deliveryTime: "Same-Day / Next-Day",
        message: "Doorstep delivery available across Delhi NCR (Fitment is customer responsibility).",
      });
    } else if (firstTwo === "45" || firstTwo === "46") {
      setPincodeStatus({
        checked: true,
        available: true,
        city: "Indore / MP",
        deliveryTime: "Same-Day / Next-Day",
        message: "Doorstep delivery available across Madhya Pradesh (Fitment is customer responsibility).",
      });
    } else {
      setPincodeStatus({
        checked: true,
        available: true,
        city: "National Delivery Hub",
        deliveryTime: "24-48 Hours",
        message: "Safe doorstep delivery dispatched within 24-48 hours (Fitment is customer responsibility).",
      });
    }
  };

  const { itemCount, totalMrp, subtotal, discount, totalAmount, deliveryFee } = useMemo(() => {
    let count = 0;
    let mrpSum = 0;
    let total = 0;

    items.forEach((item) => {
      count += item.quantity;
      mrpSum += item.mrp * item.quantity;
      total += item.price * item.quantity;
    });

    return {
      itemCount: count,
      totalMrp: mrpSum,
      subtotal: total,
      discount: Math.max(0, mrpSum - total),
      totalAmount: total,
      deliveryFee: 0, // Free doorstep delivery across India (fitment is customer responsibility)
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        itemCount,
        totalMrp,
        subtotal,
        discount,
        totalAmount,
        deliveryFee,
        pincode,
        setPincode,
        pincodeStatus,
        checkPincode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
