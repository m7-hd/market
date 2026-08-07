'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InvoiceItem, Product } from '@/types';
import { uid } from '@/lib/utils';

interface CartState {
  items: InvoiceItem[];
  suspendedCarts: { id: string; name: string; items: InvoiceItem[]; createdAt: string }[];
  customerId?: string;
  customerName?: string;
  invoiceDiscount: number;
  serviceFee: number;
  pointsToRedeem: number;
  addItem: (product: Product, qty?: number, customPrice?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  updatePrice: (id: string, price: number) => void;
  updateDiscount: (id: string, discount: number) => void;
  setInvoiceDiscount: (d: number) => void;
  setServiceFee: (f: number) => void;
  setCustomer: (id: string, name: string) => void;
  setPointsToRedeem: (p: number) => void;
  suspendCart: (name: string) => void;
  resumeCart: (id: string) => void;
  deleteSuspended: (id: string) => void;
  clear: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      suspendedCarts: [],
      invoiceDiscount: 0,
      serviceFee: 0,
      pointsToRedeem: 0,
      addItem: (product, qty = 1, customPrice) => {
        const items = get().items;
        const existing = items.find((i) => i.product_id === product.id);
        const price = customPrice ?? product.prices.retail_price;
        if (existing) {
          set({
            items: items.map((i) =>
              i.product_id === product.id
                ? { ...i, quantity: i.quantity + qty, total: (i.quantity + qty) * (i.price - i.discount) }
                : i
            ),
          });
        } else {
          const newItem: InvoiceItem = {
            id: uid(),
            product_id: product.id,
            product_name: product.name,
            barcode: product.barcodes[0],
            unit: product.unit,
            quantity: qty,
            price,
            discount: 0,
            total: qty * price,
          };
          set({ items: [...items, newItem] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQty: (id, qty) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: qty, total: qty * (i.price - i.discount) } : i
          ),
        }),
      updatePrice: (id, price) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, price, total: i.quantity * (price - i.discount) } : i
          ),
        }),
      updateDiscount: (id, discount) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, discount, total: i.quantity * (i.price - discount) } : i
          ),
        }),
      setInvoiceDiscount: (d) => set({ invoiceDiscount: d }),
      setServiceFee: (f) => set({ serviceFee: f }),
      setCustomer: (id, name) => set({ customerId: id, customerName: name }),
      setPointsToRedeem: (p) => set({ pointsToRedeem: p }),
      suspendCart: (name) => {
        const { items } = get();
        set({
          suspendedCarts: [
            ...get().suspendedCarts,
            { id: uid(), name, items, createdAt: new Date().toISOString() },
          ],
          items: [],
          invoiceDiscount: 0,
          serviceFee: 0,
        });
      },
      resumeCart: (id) => {
        const cart = get().suspendedCarts.find((c) => c.id === id);
        if (cart) {
          set({ items: cart.items, suspendedCarts: get().suspendedCarts.filter((c) => c.id !== id) });
        }
      },
      deleteSuspended: (id) =>
        set({ suspendedCarts: get().suspendedCarts.filter((c) => c.id !== id) }),
      clear: () => set({ items: [], invoiceDiscount: 0, serviceFee: 0, pointsToRedeem: 0, customerId: undefined, customerName: undefined }),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.total, 0),
      getTotal: () => {
        const sub = get().items.reduce((sum, i) => sum + i.total, 0);
        return Math.max(0, sub - get().invoiceDiscount + get().serviceFee - get().pointsToRedeem);
      },
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'mhmd-cart' }
  )
);
