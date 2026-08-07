'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Warehouse, ArrowRightLeft, ClipboardCheck, Package, AlertTriangle,
  TrendingDown, Calendar, Search, Plus, Save, X, CheckCircle2,
} from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { cn, formatCurrency, formatNumber, formatDate, uid, generateTxn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader, EmptyState } from '@/components/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { products, warehouses, branches } = useDataStore();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('stock');
  const [showTransfer, setShowTransfer] = useState(false);
  const [showCount, setShowCount] = useState(false);
  const [transfers, setTransfers] = useState<TransferFormData[]>([
    { id: uid(), transfer_number: generateTxn('TRF'), from: 'المخزن الرئيسي', to: 'مخزن مدينة نصر', items: [{ name: 'أرز مصري', qty: 20 }], status: 'completed', date: new Date(Date.now() - 86400000).toISOString() },
    { id: uid(), transfer_number: generateTxn('TRF'), from: 'المخزن الرئيسي', to: 'مخزن المعادي', items: [{ name: 'كوكاكولا', qty: 50 }], status: 'pending', date: new Date().toISOString() },
  ]);
  const [counts, setCounts] = useState<CountFormData[]>([
    { id: uid(), count_number: generateTxn('CNT'), type: 'full', warehouse: 'المخزن الرئيسي', status: 'confirmed', date: new Date(Date.now() - 3 * 86400000).toISOString() },
  ]);

  const filtered = useMemo(() => products.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase())), [products, search]);
  const lowStockItems = products.filter((p) => p.stock <= p.min_stock);
  const expiringItems = products.filter((p) => p.has_expiry && p.expiry_date && new Date(p.expiry_date).getTime() - Date.now() < 60 * 86400000);
  const totalStockValue = products.reduce((sum, p) => sum + p.stock * p.prices.cost_price, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Warehouse}
        title="إدارة المخازن والمخزون"
        description="المخزون، التحويلات، الجرد، تنبيهات النقص والصلاحية"
        gradient="from-royal to-royal-light"
        action={
          <div className="flex gap-2">
            <Button variant="glass" onClick={() => setShowTransfer(true)}><ArrowRightLeft className="h-4 w-4" /> تحويل</Button>
            <Button variant="royal" onClick={() => setShowCount(true)}><ClipboardCheck className="h-4 w-4" /> جرد</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="قيمة المخزون" value={formatCurrency(totalStockValue)} icon={Package} gradient="from-royal to-royal-light" isCurrency />
        <StatCard label="منتجات منخفضة" value={lowStockItems.length} icon={AlertTriangle} gradient="from-amber-500 to-orange-500" />
        <StatCard label="قرب انتهاء الصلاحية" value={expiringItems.length} icon={Calendar} gradient="from-red-500 to-pink-500" />
        <StatCard label="عدد المخازن" value={warehouses.length} icon={Warehouse} gradient="from-cyan-500 to-blue-500" />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="stock"><Package className="h-4 w-4 ml-1" /> المخزون</TabsTrigger>
          <TabsTrigger value="alerts"><AlertTriangle className="h-4 w-4 ml-1" /> التنبيهات</TabsTrigger>
          <TabsTrigger value="transfers"><ArrowRightLeft className="h-4 w-4 ml-1" /> التحويلات</TabsTrigger>
          <TabsTrigger value="counts"><ClipboardCheck className="h-4 w-4 ml-1" /> الجرد</TabsTrigger>
        </TabsList>

        {/* Stock Tab */}
        <TabsContent value="stock" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث عن منتج..." className="pr-10" />
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-xs text-muted-foreground">
                    <th className="p-3 text-right font-semibold">المنتج</th>
                    <th className="p-3 text-center font-semibold">المخزون</th>
                    <th className="p-3 text-center font-semibold">الحد الأدنى</th>
                    <th className="p-3 text-center font-semibold">قيمة التكلفة</th>
                    <th className="p-3 text-center font-semibold">الصلاحية</th>
                    <th className="p-3 text-center font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-border/20 hover:bg-muted/30">
                      <td className="p-3"><p className="font-bold text-xs">{p.name}</p><p className="text-[10px] text-muted-foreground">{p.sku}</p></td>
                      <td className="p-3 text-center font-bold">{formatNumber(p.stock)} {p.unit}</td>
                      <td className="p-3 text-center text-xs text-muted-foreground">{formatNumber(p.min_stock)}</td>
                      <td className="p-3 text-center text-xs font-semibold">{formatCurrency(p.stock * p.prices.cost_price)}</td>
                      <td className="p-3 text-center text-xs">{p.expiry_date ? formatDate(p.expiry_date) : '-'}</td>
                      <td className="p-3 text-center">
                        {p.stock <= p.min_stock ? <Badge variant="warning" className="text-[9px]">منخفض</Badge> : <Badge variant="success" className="text-[9px]">متوفر</Badge>}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-black">تنبيهات النقص ({lowStockItems.length})</h3>
              </div>
              <div className="space-y-2">
                {lowStockItems.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg glass p-3">
                    <div>
                      <p className="font-bold text-xs">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">المخزون: {p.stock} - الحد الأدنى: {p.min_stock}</p>
                    </div>
                    <Badge variant="warning" className="text-[9px]">{p.stock}/{p.min_stock}</Badge>
                  </div>
                ))}
                {lowStockItems.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">لا توجد تنبيهات</p>}
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-red-500" />
                <h3 className="font-black">قرب انتهاء الصلاحية ({expiringItems.length})</h3>
              </div>
              <div className="space-y-2">
                {expiringItems.map((p) => {
                  const days = Math.floor((new Date(p.expiry_date!).getTime() - Date.now()) / 86400000);
                  return (
                    <div key={p.id} className="flex items-center justify-between rounded-lg glass p-3">
                      <div>
                        <p className="font-bold text-xs">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">ينتهي: {formatDate(p.expiry_date!)}</p>
                      </div>
                      <Badge variant={days < 30 ? 'destructive' : 'warning'} className="text-[9px]">{days} يوم</Badge>
                    </div>
                  );
                })}
                {expiringItems.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">لا توجد تنبيهات</p>}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="glass" onClick={() => setShowTransfer(true)}><ArrowRightLeft className="h-4 w-4" /> تحويل جديد</Button>
          </div>
          {transfers.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal/20">
                    <ArrowRightLeft className="h-5 w-5 text-royal" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.transfer_number}</p>
                    <p className="text-xs text-muted-foreground">{t.from} ← {t.to}</p>
                  </div>
                </div>
                <div className="text-left">
                  <Badge variant={t.status === 'completed' ? 'success' : 'warning'} className="text-[9px]">{t.status === 'completed' ? 'مكتمل' : 'معلق'}</Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatDate(t.date, true)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {t.items.map((item, i) => (
                  <Badge key={i} variant="outline" className="text-[9px]">{item.name} ×{item.qty}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Counts Tab */}
        <TabsContent value="counts" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="royal" onClick={() => setShowCount(true)}><ClipboardCheck className="h-4 w-4" /> جرد جديد</Button>
          </div>
          {counts.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal/20">
                    <ClipboardCheck className="h-5 w-5 text-royal" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{c.count_number}</p>
                    <p className="text-xs text-muted-foreground">{c.warehouse} - {c.type === 'full' ? 'جرد كلي' : 'جرد جزئي'}</p>
                  </div>
                </div>
                <div className="text-left">
                  <Badge variant={c.status === 'confirmed' ? 'success' : 'outline'} className="text-[9px]">{c.status === 'confirmed' ? 'مؤكد' : 'مسودة'}</Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatDate(c.date)}</p>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Transfer Sheet */}
      <Sheet open={showTransfer} onOpenChange={setShowTransfer}>
        <SheetContent side="left" className="w-[480px] overflow-y-auto">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><ArrowRightLeft className="h-5 w-5 text-royal" /> تحويل مخزون</SheetTitle></SheetHeader>
          <TransferForm warehouses={warehouses} products={products} onSave={(data) => { setTransfers([data, ...transfers]); setShowTransfer(false); toast.success('تم إنشاء التحويل'); }} onCancel={() => setShowTransfer(false)} />
        </SheetContent>
      </Sheet>

      {/* Count Sheet */}
      <Sheet open={showCount} onOpenChange={setShowCount}>
        <SheetContent side="left" className="w-[480px] overflow-y-auto">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-royal" /> جرد مخزون</SheetTitle></SheetHeader>
          <CountForm warehouses={warehouses} products={products} onSave={(data) => { setCounts([data, ...counts]); setShowCount(false); toast.success('تم إنشاء الجرد'); }} onCancel={() => setShowCount(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface TransferFormData {
  id: string;
  transfer_number: string;
  from?: string;
  to?: string;
  items: { name?: string; qty: number }[];
  status: string;
  date: string;
}

interface CountFormData {
  id: string;
  count_number: string;
  type: string;
  warehouse?: string;
  status: string;
  date: string;
}

function TransferForm({ warehouses, products, onSave, onCancel }: {
  warehouses: { id: string; name: string }[];
  products: { id: string; name: string }[];
  onSave: (data: TransferFormData) => void;
  onCancel: () => void;
}) {
  const [from, setFrom] = useState(warehouses[0]?.id || '');
  const [to, setTo] = useState(warehouses[1]?.id || '');
  const [items, setItems] = useState<{ productId: string; qty: number }[]>([{ productId: products[0]?.id || '', qty: 1 }]);

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>من مخزن</Label><Select value={from} onValueChange={setFrom}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{warehouses.map((w) => <Select.Item key={w.id} value={w.id}>{w.name}</Select.Item>)}</Select.Content></Select></div>
        <div><Label>إلى مخزن</Label><Select value={to} onValueChange={setTo}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{warehouses.map((w) => <Select.Item key={w.id} value={w.id}>{w.name}</Select.Item>)}</Select.Content></Select></div>
      </div>
      <div>
        <Label>المنتجات</Label>
        <div className="space-y-2 mt-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Select value={item.productId} onValueChange={(v) => setItems(items.map((it, idx) => idx === i ? { ...it, productId: v } : it))}>
                <Select.Trigger className="flex-1"><Select.Value /></Select.Trigger>
                <Select.Content>{products.map((p) => <Select.Item key={p.id} value={p.id}>{p.name}</Select.Item>)}</Select.Content>
              </Select>
              <Input type="number" value={item.qty} onChange={(e) => setItems(items.map((it, idx) => idx === i ? { ...it, qty: parseFloat(e.target.value) || 0 } : it))} className="w-20" />
              <Button size="icon" variant="ghost" onClick={() => setItems(items.filter((_, idx) => idx !== i))}><X className="h-4 w-4 text-red-400" /></Button>
            </div>
          ))}
          <Button size="sm" variant="glass" onClick={() => setItems([...items, { productId: products[0]?.id || '', qty: 1 }])}><Plus className="h-4 w-4" /> إضافة منتج</Button>
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <Button variant="glass" className="flex-1" onClick={onCancel}>إلغاء</Button>
        <Button variant="royal" className="flex-1" onClick={() => {
          const fromName = warehouses.find((w) => w.id === from)?.name;
          const toName = warehouses.find((w) => w.id === to)?.name;
          onSave({ id: uid(), transfer_number: generateTxn('TRF'), from: fromName, to: toName, items: items.map((it) => { const p = products.find((pp) => pp.id === it.productId); return { name: p?.name, qty: it.qty }; }), status: 'pending', date: new Date().toISOString() });
        }}><Save className="h-5 w-5" /> حفظ التحويل</Button>
      </div>
    </div>
  );
}

function CountForm({ warehouses, products, onSave, onCancel }: {
  warehouses: { id: string; name: string }[];
  products: { id: string; stock: number; name: string }[];
  onSave: (data: CountFormData) => void;
  onCancel: () => void;
}) {
  const [warehouse, setWarehouse] = useState(warehouses[0]?.id || '');
  const [type, setType] = useState('full');
  const [items, setItems] = useState(products.slice(0, 5).map((p) => ({ productId: p.id, systemQty: p.stock, actualQty: p.stock })));

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>المخزن</Label><Select value={warehouse} onValueChange={setWarehouse}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{warehouses.map((w) => <Select.Item key={w.id} value={w.id}>{w.name}</Select.Item>)}</Select.Content></Select></div>
        <div><Label>النوع</Label><Select value={type} onValueChange={setType}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="full">جرد كلي</Select.Item><Select.Item value="partial">جرد جزئي</Select.Item></Select.Content></Select></div>
      </div>
      <div>
        <Label>المنتجات والكميات</Label>
        <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
          {items.map((item, i) => {
            const p = products.find((pp) => pp.id === item.productId);
            const diff = item.actualQty - item.systemQty;
            return (
              <div key={i} className="flex items-center gap-2 rounded-lg glass p-2">
                <span className="flex-1 text-xs font-bold truncate">{p?.name}</span>
                <span className="text-[10px] text-muted-foreground">المسجل: {item.systemQty}</span>
                <Input type="number" value={item.actualQty} onChange={(e) => setItems(items.map((it, idx) => idx === i ? { ...it, actualQty: parseFloat(e.target.value) || 0 } : it))} className="w-16 h-8 text-xs p-0 text-center" />
                <span className={cn('text-xs font-bold w-12 text-center', diff === 0 ? 'text-muted-foreground' : diff > 0 ? 'text-emerald-500' : 'text-red-500')}>{diff > 0 ? '+' : ''}{diff}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <Button variant="glass" className="flex-1" onClick={onCancel}>إلغاء</Button>
        <Button variant="royal" className="flex-1" onClick={() => {
          onSave({ id: uid(), count_number: generateTxn('CNT'), type, warehouse: warehouses.find((w) => w.id === warehouse)?.name, status: 'draft', date: new Date().toISOString() });
        }}><CheckCircle2 className="h-5 w-5" /> حفظ الجرد</Button>
      </div>
    </div>
  );
}
