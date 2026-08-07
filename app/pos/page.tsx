'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ScanLine, Trash2, Plus, Minus, ShoppingCart, Pause, Play,
  CreditCard, Banknote, Smartphone, Receipt, X, Tag, User, Percent,
  Package, AlertCircle, CheckCircle2, Printer, Scale, Gift,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useDataStore } from '@/stores/data-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn, formatCurrency, formatNumber, uid, generateTxn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import type { Product, PaymentMethod, Invoice } from '@/types';

export default function POSPage() {
  const { products, categories, customers, addInvoice } = useDataStore();
  const { user } = useAuthStore();
  const cart = useCartStore();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showSuspended, setShowSuspended] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [weightProduct, setWeightProduct] = useState<Product | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.is_active) return false;
      if (selectedCat !== 'all' && p.category_id !== selectedCat) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.name_en?.toLowerCase().includes(q) ||
          p.barcodes.some((b) => b.includes(search)) ||
          p.sku.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, search, selectedCat]);

  const handleBarcodeEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const exact = products.find((p) => p.barcodes.includes(search.trim()));
      if (exact) {
        if (exact.is_weighted) {
          setWeightProduct(exact);
        } else {
          cart.addItem(exact);
          toast.success(`تم إضافة ${exact.name}`);
        }
        setSearch('');
      } else if (filteredProducts.length > 0) {
        const p = filteredProducts[0];
        if (p.is_weighted) setWeightProduct(p);
        else {
          cart.addItem(p);
          toast.success(`تم إضافة ${p.name}`);
        }
        setSearch('');
      }
    }
  };

  const handleCheckout = (method: PaymentMethod, paid: number) => {
    const subtotal = cart.getSubtotal();
    const total = cart.getTotal();
    const change = Math.max(0, paid - total);
    const invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> = {
      invoice_number: generateTxn('INV'),
      customer_id: cart.customerId,
      customer_name: cart.customerName || 'عميل نقدي',
      cashier_id: user?.id || 'user-1',
      cashier_name: user?.full_name || 'مدير النظام',
      items: cart.items,
      subtotal,
      discount: cart.invoiceDiscount,
      service_fee: cart.serviceFee,
      tax: 0,
      total,
      paid,
      change,
      payment_method: method,
      points_earned: Math.floor(total * 0.1),
      points_redeemed: cart.pointsToRedeem,
      status: 'completed',
      qr_data: `${generateTxn('INV')}-${total}`,
    };
    addInvoice(invoice);
    toast.success(`تم إتمام البيع بنجاح - ${formatCurrency(total)}`);
    if (change > 0) toast.info(`الباقي للعميل: ${formatCurrency(change)}`);
    cart.clear();
    setShowCheckout(false);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4 p-4">
      {/* ===== Left: Products ===== */}
      <div className="flex flex-1 flex-col gap-3">
        {/* Search & Actions */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleBarcodeEnter}
              placeholder="امسح الباركود أو ابحث بالاسم..."
              className="pr-10 h-12 text-base glass-strong border-border/50"
            />
            <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-400 animate-pulse" />
          </div>
          <Button variant="glass" size="lg" onClick={() => setShowSuspended(true)} className="relative">
            <Pause className="h-5 w-5" />
            {cart.suspendedCarts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-white">
                {cart.suspendedCarts.length}
              </span>
            )}
          </Button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCat('all')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all',
              selectedCat === 'all' ? 'bg-gradient-luxury text-white shadow-glow-orange' : 'glass text-muted-foreground hover:text-foreground'
            )}
          >
            <Package className="h-4 w-4" /> الكل
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all',
                selectedCat === c.id ? 'bg-gradient-luxury text-white shadow-glow-orange' : 'glass text-muted-foreground hover:text-foreground'
              )}
              style={selectedCat === c.id ? {} : { borderRight: `3px solid ${c.color}` }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className={cn('grid gap-3', view === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1')}>
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p, i) => (
                <motion.button
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => (p.is_weighted ? setWeightProduct(p) : cart.addItem(p))}
                  className="group relative flex flex-col overflow-hidden rounded-2xl glass-card p-3 text-right transition-all hover:shadow-glow-orange"
                >
                  {p.stock <= p.min_stock && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="warning" className="text-[9px]">منخفض</Badge>
                    </div>
                  )}
                  {p.is_weighted && (
                    <div className="absolute top-2 right-2 z-10">
                      <Scale className="h-4 w-4 text-brand-400" />
                    </div>
                  )}
                  <div className="relative mb-2 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-muted/40 to-muted/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="line-clamp-2 text-xs font-bold leading-tight mb-1">{p.name}</h3>
                  <p className="text-[10px] text-muted-foreground mb-2">{p.category_name}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-sm font-black text-gradient-luxury">{formatCurrency(p.prices.retail_price)}</span>
                    <span className={cn('text-[10px] font-semibold', p.stock <= p.min_stock ? 'text-amber-500' : 'text-emerald-500')}>
                      {p.stock} {p.unit}
                    </span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <Package className="mb-3 h-12 w-12 opacity-50" />
              <p>لا توجد منتجات مطابقة</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== Right: Cart ===== */}
      <div className="flex w-[420px] flex-col rounded-2xl glass-strong border border-border/40 overflow-hidden">
        {/* Cart Header */}
        <div className="flex items-center justify-between border-b border-border/30 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-luxury shadow-glow-orange">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-sm">السلة الحالية</h2>
              <p className="text-[10px] text-muted-foreground">{cart.getCount()} قطعة</p>
            </div>
          </div>
          {cart.items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => cart.clear()}>
              <Trash2 className="h-4 w-4 text-red-400" />
            </Button>
          )}
        </div>

        {/* Customer Selector */}
        <button
          onClick={() => setShowCustomer(true)}
          className="flex items-center gap-2 border-b border-border/30 p-3 text-sm transition-all hover:bg-muted/30"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
            <User className="h-4 w-4 text-cyan-400" />
          </div>
          <span className="font-semibold">{cart.customerName || 'عميل نقدي'}</span>
          {cart.customerName && <Badge variant="success" className="ml-auto text-[9px]">عميل مسجل</Badge>}
        </button>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {cart.items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full flex-col items-center justify-center text-muted-foreground"
              >
                <ShoppingCart className="mb-3 h-16 w-16 opacity-20" />
                <p className="text-sm">السلة فارغة</p>
                <p className="text-xs">امسح منتج أو ابحث لإضافته</p>
              </motion.div>
            ) : (
              cart.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="group rounded-xl glass p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate text-xs font-bold">{item.product_name}</h4>
                      <p className="text-[10px] text-muted-foreground">{formatCurrency(item.price)} / {item.unit}</p>
                    </div>
                    <button onClick={() => cart.removeItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => cart.updateQty(item.id, item.quantity - 1)} className="flex h-6 w-6 items-center justify-center rounded-lg glass hover:glass-strong">
                        <Minus className="h-3 w-3" />
                      </button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => cart.updateQty(item.id, parseFloat(e.target.value) || 0)}
                        className="h-6 w-14 text-center text-xs p-0"
                      />
                      <button onClick={() => cart.updateQty(item.id, item.quantity + 1)} className="flex h-6 w-6 items-center justify-center rounded-lg glass hover:glass-strong">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        placeholder="خصم"
                        value={item.discount || ''}
                        onChange={(e) => cart.updateDiscount(item.id, parseFloat(e.target.value) || 0)}
                        className="h-6 w-16 text-center text-xs p-0"
                      />
                      <span className="text-sm font-black text-gradient-luxury">{formatCurrency(item.total)}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Cart Summary & Actions */}
        {cart.items.length > 0 && (
          <div className="border-t border-border/30 p-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع الفرعي</span>
                <span>{formatCurrency(cart.getSubtotal())}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1"><Percent className="h-3 w-3" /> خصم الفاتورة</span>
                <Input
                  type="number"
                  value={cart.invoiceDiscount || ''}
                  onChange={(e) => cart.setInvoiceDiscount(parseFloat(e.target.value) || 0)}
                  className="h-6 w-20 text-xs p-0 text-left"
                />
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>خدمة توصيل</span>
                <Input
                  type="number"
                  value={cart.serviceFee || ''}
                  onChange={(e) => cart.setServiceFee(parseFloat(e.target.value) || 0)}
                  className="h-6 w-20 text-xs p-0 text-left"
                />
              </div>
              <div className="flex items-center justify-between border-t border-border/20 pt-2 text-base font-black">
                <span>الإجمالي</span>
                <span className="text-gradient-luxury text-lg">{formatCurrency(cart.getTotal())}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="glass"
                onClick={() => {
                  const name = prompt('اسم الفاتورة المعلقة:');
                  if (name) {
                    cart.suspendCart(name);
                    toast.success('تم تعليق الفاتورة');
                  }
                }}
              >
                <Pause className="h-4 w-4" /> تعليق
              </Button>
              <Button
                variant="luxury"
                size="lg"
                onClick={() => setShowCheckout(true)}
                className="font-black"
              >
                <Receipt className="h-5 w-5" /> دفع الآن
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Weight Modal ===== */}
      <WeightModal product={weightProduct} onClose={() => setWeightProduct(null)} onConfirm={(p, kg) => { cart.addItem(p, kg); toast.success(`تم إضافة ${p.name} (${kg} ${p.unit})`); setWeightProduct(null); }} />

      {/* ===== Suspended Carts Sheet ===== */}
      <Sheet open={showSuspended} onOpenChange={setShowSuspended}>
        <SheetContent side="left" className="w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Pause className="h-5 w-5 text-gold-400" /> الفواتير المعلقة</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {cart.suspendedCarts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">لا توجد فواتير معلقة</p>
            ) : (
              cart.suspendedCarts.map((sc) => (
                <div key={sc.id} className="rounded-xl glass p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm">{sc.name}</h4>
                    <span className="text-xs text-muted-foreground">{sc.items.length} قطعة</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="emerald" className="flex-1" onClick={() => { cart.resumeCart(sc.id); setShowSuspended(false); toast.success('تم استرجاع الفاتورة'); }}>
                      <Play className="h-4 w-4" /> استرجاع
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => { cart.deleteSuspended(sc.id); toast.success('تم حذف الفاتورة'); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ===== Customer Selector Sheet ===== */}
      <Sheet open={showCustomer} onOpenChange={setShowCustomer}>
        <SheetContent side="left" className="w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><User className="h-5 w-5 text-cyan-400" /> اختيار العميل</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => { cart.setCustomer('', 'عميل نقدي'); setShowCustomer(false); toast.success('تم اختيار: عميل نقدي'); }}
              className="w-full rounded-xl glass p-3 text-right hover:glass-strong transition-all"
            >
              <span className="font-semibold text-sm">عميل نقدي</span>
            </button>
            {customers.filter((c) => c.phone !== '0000000000').map((c) => (
              <button
                key={c.id}
                onClick={() => { cart.setCustomer(c.id, c.name); setShowCustomer(false); toast.success(`تم اختيار: ${c.name}`); }}
                className="w-full rounded-xl glass p-3 text-right hover:glass-strong transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm">{c.name}</span>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="gold" className="text-[9px]">{c.loyalty_tier}</Badge>
                    <Badge variant="outline" className="text-[9px]">{c.points} نقطة</Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* ===== Checkout Sheet ===== */}
      <CheckoutSheet
        open={showCheckout}
        onOpenChange={setShowCheckout}
        total={cart.getTotal()}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

// ===== Weight Modal =====
function WeightModal({ product, onClose, onConfirm }: { product: Product | null; onClose: () => void; onConfirm: (p: Product, kg: number) => void }) {
  const [weight, setWeight] = useState(1);
  useEffect(() => { if (product) setWeight(1); }, [product]);
  if (!product) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl glass-strong border border-border/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20">
              <Scale className="h-6 w-6 text-brand-400" />
            </div>
            <div>
              <h3 className="font-black">{product.name}</h3>
              <p className="text-xs text-muted-foreground">يُباع بالوزن - {formatCurrency(product.prices.retail_price)} / {product.unit}</p>
            </div>
          </div>
          <Label>الوزن ({product.unit})</Label>
          <Input
            type="number"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
            className="h-14 text-2xl font-black text-center my-3"
            autoFocus
          />
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[0.25, 0.5, 1, 2].map((w) => (
              <button key={w} onClick={() => setWeight(w)} className="rounded-lg glass py-2 text-sm font-bold hover:glass-strong transition-all">{w} {product.unit}</button>
            ))}
          </div>
          <div className="flex items-center justify-between mb-4 rounded-xl bg-gradient-luxury p-4">
            <span className="text-white font-bold">الإجمالي</span>
            <span className="text-white text-2xl font-black">{formatCurrency(weight * product.prices.retail_price)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="glass" className="flex-1" onClick={onClose}>إلغاء</Button>
            <Button variant="luxury" className="flex-1" onClick={() => onConfirm(product, weight)}>
              <CheckCircle2 className="h-5 w-5" /> تأكيد
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ===== Checkout Sheet =====
function CheckoutSheet({ open, onOpenChange, total, onCheckout }: { open: boolean; onOpenChange: (o: boolean) => void; total: number; onCheckout: (method: PaymentMethod, paid: number) => void }) {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [paid, setPaid] = useState(total);
  const change = Math.max(0, paid - total);

  useEffect(() => { if (open) { setPaid(total); setMethod('cash'); } }, [open, total]);

  const methods: { value: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'cash', label: 'نقدي', icon: <Banknote className="h-5 w-5" />, color: 'from-emerald-500 to-green-600' },
    { value: 'card', label: 'بطاقة', icon: <CreditCard className="h-5 w-5" />, color: 'from-blue-500 to-indigo-600' },
    { value: 'vodafone_cash', label: 'فودافون كاش', icon: <Smartphone className="h-5 w-5" />, color: 'from-vodafone to-red-700' },
    { value: 'credit', label: 'آجل', icon: <Receipt className="h-5 w-5" />, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[440px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-brand-400" /> إتمام الدفع</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {/* Total Display */}
          <div className="rounded-2xl bg-gradient-luxury p-6 text-center shadow-glow-orange">
            <p className="text-white/80 text-sm">إجمالي الفاتورة</p>
            <p className="text-white text-4xl font-black mt-1">{formatCurrency(total)}</p>
          </div>

          {/* Payment Methods */}
          <div>
            <Label className="mb-2 block">طريقة الدفع</Label>
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMethod(m.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl p-3 text-sm font-bold transition-all',
                    method === m.value ? `bg-gradient-to-r ${m.color} text-white shadow-lg` : 'glass text-muted-foreground hover:text-foreground'
                  )}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Paid */}
          {method !== 'credit' && (
            <div>
              <Label className="mb-2 block">المبلغ المدفوع</Label>
              <Input
                type="number"
                value={paid}
                onChange={(e) => setPaid(parseFloat(e.target.value) || 0)}
                className="h-14 text-2xl font-black text-center"
                autoFocus
              />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[total, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100, Math.ceil(total / 100) * 100 + 100].map((amt, i) => (
                  <button key={i} onClick={() => setPaid(amt)} className="rounded-lg glass py-2 text-xs font-bold hover:glass-strong transition-all">
                    {formatNumber(amt)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Change */}
          {method !== 'credit' && (
            <div className={cn('flex items-center justify-between rounded-xl p-4', change > 0 ? 'bg-gold-500/20' : 'bg-emerald-500/10')}>
              <span className="font-bold flex items-center gap-2">
                {change > 0 ? <AlertCircle className="h-5 w-5 text-gold-400" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                {change > 0 ? 'الباقي للعميل' : 'مبلغ مضبوط'}
              </span>
              <span className={cn('text-2xl font-black', change > 0 ? 'text-gold-400' : 'text-emerald-400')}>{formatCurrency(change)}</span>
            </div>
          )}

          {/* Confirm */}
          <Button
            variant="luxury"
            size="xl"
            className="w-full"
            onClick={() => onCheckout(method, method === 'credit' ? total : paid)}
            disabled={method !== 'credit' && paid < total}
          >
            <Printer className="h-6 w-6" /> تأكيد الدفع وطباعة
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
