'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Search, Edit2, Trash2, Barcode, QrCode, Tag,
  Layers, DollarSign, AlertTriangle, TrendingUp, X, Save,
} from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { cn, formatCurrency, formatNumber, generateBarcode, uid } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PageHeader, EmptyState } from '@/components/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { toast } from 'sonner';
import type { Product, SaleUnit } from '@/types';
import QRCode from 'qrcode';

export default function ProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useDataStore();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCat !== 'all' && p.category_id !== selectedCat) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcodes.some((b) => b.includes(search));
      }
      return true;
    });
  }, [products, search, selectedCat]);

  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock <= p.min_stock).length;
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.prices.cost_price, 0);
  const expiringSoon = products.filter((p) => p.has_expiry && p.expiry_date && new Date(p.expiry_date).getTime() - Date.now() < 60 * 86400000).length;

  const handleSave = (data: any) => {
    if (editProduct) {
      updateProduct(editProduct.id, data);
      toast.success('تم تحديث المنتج بنجاح');
    } else {
      addProduct(data);
      toast.success('تم إضافة المنتج بنجاح');
    }
    setShowForm(false);
    setEditProduct(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="إدارة المنتجات"
        description="إدارة كاملة لمنتجات السوبر ماركت - الأكواد، الأسعار، الصور، والمخزون"
        gradient="from-emerald2-500 to-emerald2-600"
        action={
          <Button variant="emerald" size="lg" onClick={() => { setEditProduct(null); setShowForm(true); }}>
            <Plus className="h-5 w-5" /> منتج جديد
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي المنتجات" value={totalProducts} icon={Package} gradient="from-emerald2-500 to-emerald2-600" trend="+3 هذا الأسبوع" />
        <StatCard label="منتجات منخفضة" value={lowStock} icon={AlertTriangle} gradient="from-amber-500 to-orange-500" trend="تحتاج إعادة طلب" />
        <StatCard label="قيمة المخزون" value={formatCurrency(totalValue)} icon={DollarSign} gradient="from-gold-400 to-gold-600" isCurrency />
        <StatCard label="قرب انتهاء الصلاحية" value={expiringSoon} icon={TrendingUp} gradient="from-red-500 to-pink-500" trend="خلال 60 يوم" />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم، الكود، الباركود..." className="pr-10" />
        </div>
        <Select value={selectedCat} onValueChange={setSelectedCat}>
          <Select.Trigger className="w-[180px]"><Select.Value /></Select.Trigger>
          <Select.Content>
            <Select.Item value="all">جميع الفئات</Select.Item>
            {categories.map((c) => (
              <Select.Item key={c.id} value={c.id}>{c.name}</Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 text-xs text-muted-foreground">
                <th className="p-3 text-right font-semibold">المنتج</th>
                <th className="p-3 text-right font-semibold">SKU</th>
                <th className="p-3 text-right font-semibold">الفئة</th>
                <th className="p-3 text-right font-semibold">سعر التكلفة</th>
                <th className="p-3 text-right font-semibold">سعر الجملة</th>
                <th className="p-3 text-right font-semibold">سعر القطاعي</th>
                <th className="p-3 text-center font-semibold">المخزون</th>
                <th className="p-3 text-center font-semibold">الحالة</th>
                <th className="p-3 text-center font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted/20 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">{p.name}</p>
                          {p.is_weighted && <Badge variant="gold" className="text-[8px] mt-0.5">بالوزن</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground font-mono">{p.sku}</td>
                    <td className="p-3 text-xs">{p.category_name}</td>
                    <td className="p-3 text-xs font-semibold">{formatCurrency(p.prices.cost_price)}</td>
                    <td className="p-3 text-xs font-semibold text-blue-400">{formatCurrency(p.prices.wholesale_price)}</td>
                    <td className="p-3 text-xs font-bold text-gradient-luxury">{formatCurrency(p.prices.retail_price)}</td>
                    <td className="p-3 text-center">
                      <span className={cn('text-xs font-bold', p.stock <= p.min_stock ? 'text-amber-500' : 'text-emerald-500')}>
                        {formatNumber(p.stock)} {p.unit}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {p.stock <= p.min_stock ? <Badge variant="warning" className="text-[9px]">منخفض</Badge> : <Badge variant="success" className="text-[9px]">متوفر</Badge>}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="iconSm" variant="ghost" onClick={() => setQrProduct(p)}><QrCode className="h-4 w-4 text-royal" /></Button>
                        <Button size="iconSm" variant="ghost" onClick={() => { setEditProduct(p); setShowForm(true); }}><Edit2 className="h-4 w-4 text-blue-400" /></Button>
                        <Button size="iconSm" variant="ghost" onClick={() => { if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) { deleteProduct(p.id); toast.success('تم حذف المنتج'); } }}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState icon={Package} title="لا توجد منتجات" description="ابدأ بإضافة منتجاتك" />}
      </Card>

      {/* Product Form Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="left" className="w-[520px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald2-400" />
              {editProduct ? 'تعديل المنتج' : 'منتج جديد'}
            </SheetTitle>
          </SheetHeader>
          <ProductForm product={editProduct} categories={categories} onSave={handleSave} onCancel={() => setShowForm(false)} />
        </SheetContent>
      </Sheet>

      {/* QR Modal */}
      <QRModal product={qrProduct} onClose={() => setQrProduct(null)} />
    </div>
  );
}

// ===== Product Form =====
function ProductForm({ product, categories, onSave, onCancel }: { product: Product | null; categories: any[]; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    name_en: product?.name_en || '',
    sku: product?.sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
    barcodes: product?.barcodes || [generateBarcode()],
    category_id: product?.category_id || categories[0]?.id || '',
    category_name: product?.category_name || categories[0]?.name || '',
    images: product?.images || ['https://images.unsplash.com/photo-1542838132-92c53300691b?w=200'],
    unit: product?.unit || 'piece',
    cost_price: product?.prices.cost_price || 0,
    wholesale_price: product?.prices.wholesale_price || 0,
    half_wholesale_price: product?.prices.half_wholesale_price || 0,
    retail_price: product?.prices.retail_price || 0,
    special_price: product?.prices.special_price || 0,
    stock: product?.stock || 0,
    min_stock: product?.min_stock || 5,
    has_expiry: product?.has_expiry || false,
    expiry_date: product?.expiry_date || '',
    is_weighted: product?.is_weighted || false,
    is_active: product?.is_active ?? true,
  });

  const units: SaleUnit[] = ['carton', 'half_carton', 'piece', 'kg', 'gram', 'liter', 'box', 'pack'];

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>اسم المنتج (عربي)</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: أرز مصري 1 كجم" />
        </div>
        <div>
          <Label>الاسم (إنجليزي)</Label>
          <Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} placeholder="English name" dir="ltr" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>SKU</Label>
          <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="font-mono" />
        </div>
        <div>
          <Label>الفئة</Label>
          <Select value={form.category_id} onValueChange={(v) => { const cat = categories.find((c) => c.id === v); setForm({ ...form, category_id: v, category_name: cat?.name || '' }); }}>
            <Select.Trigger><Select.Value placeholder="اختر الفئة" /></Select.Trigger>
            <Select.Content>
              {categories.map((c) => <Select.Item key={c.id} value={c.id}>{c.name}</Select.Item>)}
            </Select.Content>
          </Select>
        </div>
      </div>
      <div>
        <Label>الباركودات (متعدد)</Label>
        <div className="flex gap-2 flex-wrap">
          {form.barcodes.map((b, i) => (
            <div key={i} className="flex items-center gap-1 rounded-lg glass px-2 py-1">
              <span className="font-mono text-xs">{b}</span>
              <button onClick={() => setForm({ ...form, barcodes: form.barcodes.filter((_, idx) => idx !== i) })}><X className="h-3 w-3 text-red-400" /></button>
            </div>
          ))}
          <Button size="sm" variant="glass" onClick={() => setForm({ ...form, barcodes: [...form.barcodes, generateBarcode()] })}>
            <Plus className="h-3 w-3" /> باركود
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div><Label>التكلفة</Label><Input type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })} /></div>
        <div><Label>الجملة</Label><Input type="number" value={form.wholesale_price} onChange={(e) => setForm({ ...form, wholesale_price: parseFloat(e.target.value) || 0 })} /></div>
        <div><Label>نصف جملة</Label><Input type="number" value={form.half_wholesale_price} onChange={(e) => setForm({ ...form, half_wholesale_price: parseFloat(e.target.value) || 0 })} /></div>
        <div><Label>القطاعي</Label><Input type="number" value={form.retail_price} onChange={(e) => setForm({ ...form, retail_price: parseFloat(e.target.value) || 0 })} /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>الوحدة</Label>
          <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v as SaleUnit })}>
            <Select.Trigger><Select.Value /></Select.Trigger>
            <Select.Content>
              {units.map((u) => <Select.Item key={u} value={u}>{u}</Select.Item>)}
            </Select.Content>
          </Select>
        </div>
        <div><Label>المخزون</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })} /></div>
        <div><Label>حد التنبيه</Label><Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: parseFloat(e.target.value) || 0 })} /></div>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.is_weighted} onChange={(e) => setForm({ ...form, is_weighted: e.target.checked })} className="accent-brand-500 h-4 w-4" />
          يُباع بالوزن
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.has_expiry} onChange={(e) => setForm({ ...form, has_expiry: e.target.checked })} className="accent-brand-500 h-4 w-4" />
          له تاريخ صلاحية
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-brand-500 h-4 w-4" />
          نشط
        </label>
      </div>
      {form.has_expiry && (
        <div><Label>تاريخ انتهاء الصلاحية</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
      )}
      <div className="flex gap-2 pt-4">
        <Button variant="glass" className="flex-1" onClick={onCancel}>إلغاء</Button>
        <Button variant="emerald" className="flex-1" onClick={() => {
          if (!form.name) { toast.error('يرجى إدخال اسم المنتج'); return; }
          onSave({
            name: form.name, name_en: form.name_en, sku: form.sku, barcodes: form.barcodes,
            category_id: form.category_id, category_name: form.category_name,
            images: form.images, unit: form.unit,
            prices: { unit: form.unit, cost_price: form.cost_price, wholesale_price: form.wholesale_price, half_wholesale_price: form.half_wholesale_price, retail_price: form.retail_price, special_price: form.special_price || undefined },
            stock: form.stock, min_stock: form.min_stock, has_expiry: form.has_expiry, expiry_date: form.expiry_date || undefined,
            is_weighted: form.is_weighted, is_active: form.is_active,
          });
        }}>
          <Save className="h-5 w-5" /> حفظ
        </Button>
      </div>
    </div>
  );
}

// ===== QR Modal =====
function QRModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (!product) { setQrUrl(''); return; }
    const data = JSON.stringify({ id: product.id, name: product.name, sku: product.sku, price: product.prices.retail_price });
    QRCode.toDataURL(data, { width: 300, margin: 2, color: { dark: '#f97316', light: '#ffffff' } }).then(setQrUrl).catch(() => {});
  }, [product]);

  if (!product) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="rounded-2xl glass-strong border border-border/50 p-6 text-center max-w-sm">
          <h3 className="font-black mb-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground mb-4">{product.sku} - {formatCurrency(product.prices.retail_price)}</p>
          {qrUrl && <img src={qrUrl} alt="QR" className="mx-auto rounded-xl shadow-glow-orange" />}
          <Button variant="glass" className="w-full mt-4" onClick={onClose}>إغلاق</Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
