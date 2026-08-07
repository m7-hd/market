'use client';

import { useState, useMemo, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, Search, Phone, MessageCircle, Globe,
  Store, Truck, Package, MapPin, Clock, CheckCircle2, XCircle,
  ChefHat, Bike, Save, X,
} from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { cn, formatCurrency, formatDate, uid, generateTxn } from '@/lib/utils';
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
import type { Order, OrderChannel, OrderStatus, OrderFulfillment, InvoiceItem } from '@/types';

const channelConfig: Record<OrderChannel, { label: string; icon: ComponentType<{ className?: string }>; color: string }> = {
  in_store: { label: 'داخل المتجر', icon: Store, color: 'from-emerald-500 to-green-600' },
  whatsapp: { label: 'واتساب', icon: MessageCircle, color: 'from-green-500 to-emerald-600' },
  phone: { label: 'هاتف', icon: Phone, color: 'from-blue-500 to-indigo-600' },
  online: { label: 'أونلاين', icon: Globe, color: 'from-purple-500 to-fuchsia-600' },
};

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: ComponentType<{ className?: string }> }> = {
  new: { label: 'جديد', color: 'from-blue-500 to-indigo-600', icon: Clock },
  confirmed: { label: 'مؤكد', color: 'from-cyan-500 to-blue-600', icon: CheckCircle2 },
  preparing: { label: 'قيد التحضير', color: 'from-amber-500 to-orange-600', icon: ChefHat },
  out_for_delivery: { label: 'في الطريق', color: 'from-vodafone to-red-700', icon: Bike },
  delivered: { label: 'تم التسليم', color: 'from-emerald-500 to-green-600', icon: Package },
  cancelled: { label: 'ملغي', color: 'from-red-500 to-pink-600', icon: XCircle },
};

const statusFlow: OrderStatus[] = ['new', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export default function OrdersPage() {
  const { orders, customers, updateOrderStatus, addOrder } = useDataStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const filtered = useMemo(() => orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search) return o.customer_name.includes(search) || o.customer_phone.includes(search) || o.order_number.includes(search);
    return true;
  }), [orders, search, statusFilter]);

  const newOrders = orders.filter((o) => o.status === 'new').length;
  const inProgress = orders.filter((o) => ['confirmed', 'preparing', 'out_for_delivery'].includes(o.status)).length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;
  const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);

  const advanceStatus = (order: Order) => {
    const idx = statusFlow.indexOf(order.status);
    if (idx < statusFlow.length - 1) {
      updateOrderStatus(order.id, statusFlow[idx + 1]);
      toast.success(`تم تحديث الطلب إلى: ${statusConfig[statusFlow[idx + 1]].label}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="إدارة الطلبات"
        description="طلبات المتجر، واتساب، هاتف، أونلاين - توصيل واستلام"
        gradient="from-indigo-500 to-purple-500"
        action={<Button size="lg" onClick={() => setShowForm(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"><Plus className="h-5 w-5" /> طلب جديد</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="طلبات جديدة" value={newOrders} icon={Clock} gradient="from-blue-500 to-indigo-600" />
        <StatCard label="قيد التنفيذ" value={inProgress} icon={ChefHat} gradient="from-amber-500 to-orange-600" />
        <StatCard label="تم تسليمها" value={delivered} icon={CheckCircle2} gradient="from-emerald-500 to-green-600" />
        <StatCard label="إيرادات الطلبات" value={formatCurrency(totalRevenue)} icon={Truck} gradient="from-gold-400 to-gold-600" isCurrency />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث برقم الطلب، العميل، الهاتف..." className="pr-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <Select.Trigger className="w-[160px]"><Select.Value /></Select.Trigger>
          <Select.Content>
            <Select.Item value="all">جميع الحالات</Select.Item>
            {Object.entries(statusConfig).map(([k, v]) => <Select.Item key={k} value={k}>{v.label}</Select.Item>)}
          </Select.Content>
        </Select>
      </div>

      {/* Orders */}
      <div className="grid lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((o, i) => {
            const chConfig = channelConfig[o.channel];
            const stConfig = statusConfig[o.status];
            const ChIcon = chConfig.icon;
            const StIcon = stConfig.icon;
            return (
              <motion.div key={o.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}>
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', chConfig.color)}>
                        <ChIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{o.order_number}</p>
                        <p className="text-xs text-muted-foreground">{o.customer_name} - {o.customer_phone}</p>
                      </div>
                    </div>
                    <Badge className={cn('text-[9px] bg-gradient-to-r text-white border-0', stConfig.color)}>
                      <StIcon className="h-3 w-3 ml-1" /> {stConfig.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {o.items.map((item, j) => <Badge key={j} variant="outline" className="text-[9px]">{item.product_name} ×{item.quantity}</Badge>)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(o.created_at, true)}</span>
                    <span className="flex items-center gap-1">
                      {o.fulfillment === 'delivery' ? <><Truck className="h-3 w-3" /> توصيل</> : <><Package className="h-3 w-3" /> استلام</>}
                    </span>
                    {o.assigned_to && <span className="text-brand-400">{o.assigned_to}</span>}
                  </div>
                  {o.address && <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3"><MapPin className="h-3 w-3" /> {o.address}</p>}
                  <div className="flex items-center justify-between border-t border-border/20 pt-3">
                    <span className="text-lg font-black text-gradient-luxury">{formatCurrency(o.total)}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="glass" onClick={() => setDetailOrder(o)}>تفاصيل</Button>
                      {o.status !== 'delivered' && o.status !== 'cancelled' && (
                        <>
                          <Button size="sm" variant="destructive" onClick={() => { updateOrderStatus(o.id, 'cancelled'); toast.success('تم إلغاء الطلب'); }}><XCircle className="h-3 w-3" /></Button>
                          {statusFlow.indexOf(o.status) < statusFlow.length - 1 && (
                            <Button size="sm" variant="emerald" onClick={() => advanceStatus(o)}><CheckCircle2 className="h-3 w-3" /> التالي</Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {filtered.length === 0 && <EmptyState icon={ClipboardList} title="لا توجد طلبات" description="لم يتم العثور على طلبات" />}

      {/* New Order Form */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="left" className="w-[480px] overflow-y-auto">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-indigo-400" /> طلب جديد</SheetTitle></SheetHeader>
          <OrderForm customers={customers} onSave={(data) => { addOrder(data); setShowForm(false); toast.success('تم إنشاء الطلب'); }} onCancel={() => setShowForm(false)} />
        </SheetContent>
      </Sheet>

      {/* Detail */}
      <Sheet open={!!detailOrder} onOpenChange={(o) => !o && setDetailOrder(null)}>
        <SheetContent side="left" className="w-[480px] overflow-y-auto">
          {detailOrder && (
            <>
              <SheetHeader><SheetTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-indigo-400" /> تفاصيل الطلب</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white">
                  <p className="text-sm opacity-80">رقم الطلب</p>
                  <p className="text-2xl font-black">{detailOrder.order_number}</p>
                  <Badge className="mt-2 bg-white/20 text-white border-0">{statusConfig[detailOrder.status].label}</Badge>
                </div>
                <Card className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">العميل</span><span className="font-bold">{detailOrder.customer_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">الهاتف</span><span>{detailOrder.customer_phone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">القناة</span><span>{channelConfig[detailOrder.channel].label}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">النوع</span><span>{detailOrder.fulfillment === 'delivery' ? 'توصيل' : 'استلام'}</span></div>
                  {detailOrder.address && <div className="flex justify-between"><span className="text-muted-foreground">العنوان</span><span className="text-left max-w-[200px]">{detailOrder.address}</span></div>}
                  {detailOrder.notes && <div className="flex justify-between"><span className="text-muted-foreground">ملاحظات</span><span>{detailOrder.notes}</span></div>}
                </Card>
                <div>
                  <h4 className="font-bold mb-2">المنتجات</h4>
                  <div className="space-y-2">
                    {detailOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg glass p-3">
                        <span className="text-sm font-bold">{item.product_name} ×{item.quantity}</span>
                        <span className="text-sm font-bold text-gradient-luxury">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-gradient-luxury p-4 text-white">
                  <span className="font-bold">الإجمالي</span>
                  <span className="text-2xl font-black">{formatCurrency(detailOrder.total)}</span>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function OrderForm({ customers, onSave, onCancel }: {
  customers: { id: string; name: string; phone: string }[];
  onSave: (data: Partial<Order> & { order_number: string; customer_name: string; customer_phone: string; channel: Order['channel']; fulfillment: Order['fulfillment']; items: InvoiceItem[]; total: number; status: Order['status'] }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', channel: 'whatsapp' as OrderChannel,
    fulfillment: 'delivery' as OrderFulfillment, address: '', notes: '',
  });
  return (
    <div className="mt-4 space-y-4">
      <div>
        <Label>اختر عميل</Label>
        <Select value={form.customer_name} onValueChange={(v) => { const c = customers.find((cc) => cc.name === v); setForm({ ...form, customer_name: v, customer_phone: c?.phone || '' }); }}>
          <Select.Trigger><Select.Value placeholder="اختر من العملاء" /></Select.Trigger>
          <Select.Content>{customers.map((c) => <Select.Item key={c.id} value={c.name}>{c.name} - {c.phone}</Select.Item>)}</Select.Content>
        </Select>
      </div>
      <div><Label>اسم العميل</Label><Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></div>
      <div><Label>الهاتف</Label><Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>القناة</Label>
          <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v as OrderChannel })}>
            <Select.Trigger><Select.Value /></Select.Trigger>
            <Select.Content>
              <Select.Item value="in_store">داخل المتجر</Select.Item>
              <Select.Item value="whatsapp">واتساب</Select.Item>
              <Select.Item value="phone">هاتف</Select.Item>
              <Select.Item value="online">أونلاين</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div>
          <Label>النوع</Label>
          <Select value={form.fulfillment} onValueChange={(v) => setForm({ ...form, fulfillment: v as OrderFulfillment })}>
            <Select.Trigger><Select.Value /></Select.Trigger>
            <Select.Content>
              <Select.Item value="delivery">توصيل</Select.Item>
              <Select.Item value="pickup">استلام</Select.Item>
            </Select.Content>
          </Select>
        </div>
      </div>
      {form.fulfillment === 'delivery' && <div><Label>العنوان</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>}
      <div><Label>ملاحظات</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
      <div className="flex gap-2 pt-4">
        <Button variant="glass" className="flex-1" onClick={onCancel}>إلغاء</Button>
        <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white" onClick={() => { if (!form.customer_name) { toast.error('يرجى إدخال اسم العميل'); return; } onSave({ ...form, order_number: generateTxn('ORD'), items: [], total: 0, status: 'new' }); }}><Save className="h-5 w-5" /> حفظ</Button>
      </div>
    </div>
  );
}
