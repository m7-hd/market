'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Truck, Plus, Search, Edit2, Trash2, Phone, Mail, MapPin,
  DollarSign, FileText, ArrowUpRight, ArrowDownRight, Save, X,
  ShoppingCart, RotateCcw, CreditCard,
} from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { cn, formatCurrency, formatDate, uid, generateTxn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader, EmptyState } from '@/components/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { toast } from 'sonner';
import type { Supplier } from '@/types';

export default function SuppliersPage() {
  const { suppliers, products, addSupplier, updateSupplier, deleteSupplier } = useDataStore();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [statementSupplier, setStatementSupplier] = useState<Supplier | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([
    { id: uid(), po_number: generateTxn('PO'), supplier_id: 'sup-1', supplier_name: 'شركة الدلتا للتوريدات', items: [{ name: 'أرز مصري', qty: 100, price: 18, total: 1800 }], total: 1800, paid: 1000, status: 'received', due_date: new Date(Date.now() + 7 * 86400000).toISOString(), date: new Date(Date.now() - 86400000).toISOString() },
    { id: uid(), po_number: generateTxn('PO'), supplier_id: 'sup-3', supplier_name: 'شركة المشروبات المتحدة', items: [{ name: 'كوكاكولا', qty: 200, price: 12, total: 2400 }], total: 2400, paid: 0, status: 'ordered', due_date: new Date(Date.now() + 14 * 86400000).toISOString(), date: new Date().toISOString() },
  ]);
  const [payments, setPayments] = useState<any[]>([
    { id: uid(), supplier_id: 'sup-1', amount: 1000, method: 'cash', date: new Date(Date.now() - 86400000).toISOString() },
  ]);

  const filtered = useMemo(() => suppliers.filter((s) => !search || s.name.includes(search) || s.phone.includes(search)), [suppliers, search]);
  const totalDebt = suppliers.reduce((sum, s) => sum + (s.balance > 0 ? s.balance : 0), 0);
  const totalCredit = suppliers.reduce((sum, s) => sum + (s.balance < 0 ? Math.abs(s.balance) : 0), 0);

  const handleSave = (data: { name: string; phone: string; email: string; address: string; balance: number }) => {
    if (editSupplier) { updateSupplier(editSupplier.id, data); toast.success('تم تحديث المورد'); }
    else { addSupplier(data as Omit<Supplier, 'id' | 'created_at'>); toast.success('تم إضافة المورد'); }
    setShowForm(false); setEditSupplier(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Truck}
        title="إدارة الموردين"
        description="الموردين، أوامر الشراء، المرتجعات، المدفوعات والمديونيات"
        gradient="from-amber-500 to-orange-500"
        action={<Button variant="gold" size="lg" onClick={() => { setEditSupplier(null); setShowForm(true); }}><Plus className="h-5 w-5" /> مورد جديد</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي الموردين" value={suppliers.length} icon={Truck} gradient="from-amber-500 to-orange-500" />
        <StatCard label="إجمالي المديونيات" value={formatCurrency(totalDebt)} icon={ArrowUpRight} gradient="from-red-500 to-pink-500" isCurrency />
        <StatCard label="رصيد لنا" value={formatCurrency(totalCredit)} icon={ArrowDownRight} gradient="from-emerald-500 to-green-600" isCurrency />
        <StatCard label="أوامر الشراء" value={purchaseOrders.length} icon={ShoppingCart} gradient="from-blue-500 to-indigo-600" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="list"><Truck className="h-4 w-4 ml-1" /> الموردين</TabsTrigger>
          <TabsTrigger value="po"><ShoppingCart className="h-4 w-4 ml-1" /> أوامر الشراء</TabsTrigger>
          <TabsTrigger value="returns"><RotateCcw className="h-4 w-4 ml-1" /> المرتجعات</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="h-4 w-4 ml-1" /> المدفوعات</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث عن مورد..." className="pr-10" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 hover:shadow-glow-gold transition-all cursor-pointer" >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black shadow-lg">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{s.name}</h3>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {s.phone}</p>
                      </div>
                    </div>
                  </div>
                  {s.email && <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1"><Mail className="h-3 w-3" /> {s.email}</p>}
                  {s.address && <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-3"><MapPin className="h-3 w-3" /> {s.address}</p>}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground">الرصيد</span>
                    <span className={cn('font-black text-sm', s.balance > 0 ? 'text-red-400' : s.balance < 0 ? 'text-emerald-400' : 'text-muted-foreground')}>
                      {formatCurrency(s.balance)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="glass" className="flex-1" onClick={() => setStatementSupplier(s)}><FileText className="h-3 w-3" /> كشف</Button>
                    <Button size="iconSm" variant="ghost" onClick={() => { setEditSupplier(s); setShowForm(true); }}><Edit2 className="h-3.5 w-3.5 text-blue-400" /></Button>
                    <Button size="iconSm" variant="ghost" onClick={() => { if (confirm('حذف هذا المورد؟')) { deleteSupplier(s.id); toast.success('تم حذف المورد'); } }}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="po" className="space-y-3">
          {purchaseOrders.map((po) => (
            <Card key={po.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20"><ShoppingCart className="h-5 w-5 text-blue-400" /></div>
                  <div>
                    <p className="font-bold text-sm">{po.po_number}</p>
                    <p className="text-xs text-muted-foreground">{po.supplier_name}</p>
                  </div>
                </div>
                <div className="text-left">
                  <Badge variant={po.status === 'received' ? 'success' : po.status === 'ordered' ? 'warning' : 'outline'} className="text-[9px]">
                    {po.status === 'received' ? 'مستلم' : po.status === 'ordered' ? 'مطلوب' : 'مسودة'}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">استحقاق: {formatDate(po.due_date)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {po.items.map((item: any, i: number) => <Badge key={i} variant="outline" className="text-[9px]">{item.name} ×{item.qty}</Badge>)}
              </div>
              <div className="flex items-center justify-between border-t border-border/20 pt-3">
                <div className="flex gap-4 text-xs">
                  <span className="text-muted-foreground">الإجمالي: <span className="font-bold text-foreground">{formatCurrency(po.total)}</span></span>
                  <span className="text-muted-foreground">مدفوع: <span className="font-bold text-emerald-400">{formatCurrency(po.paid)}</span></span>
                  <span className="text-muted-foreground">متبقي: <span className="font-bold text-red-400">{formatCurrency(po.total - po.paid)}</span></span>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="returns" className="space-y-3">
          <EmptyState icon={RotateCcw} title="لا توجد مرتجعات" description="لم يتم تسجيل أي مرتجعات للموردين" />
        </TabsContent>

        <TabsContent value="payments" className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20"><CreditCard className="h-5 w-5 text-emerald-400" /></div>
                <div>
                  <p className="font-bold text-sm">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">{suppliers.find((s) => s.id === p.supplier_id)?.name} - {p.method === 'cash' ? 'نقدي' : p.method === 'vodafone_cash' ? 'فودافون كاش' : 'تحويل'}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(p.date, true)}</span>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Form Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="left" className="w-[440px]">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-amber-500" /> {editSupplier ? 'تعديل مورد' : 'مورد جديد'}</SheetTitle></SheetHeader>
          <SupplierForm supplier={editSupplier} onSave={handleSave} onCancel={() => setShowForm(false)} />
        </SheetContent>
      </Sheet>

      {/* Statement Sheet */}
      <Sheet open={!!statementSupplier} onOpenChange={(o) => !o && setStatementSupplier(null)}>
        <SheetContent side="left" className="w-[520px] overflow-y-auto">
          {statementSupplier && (
            <>
              <SheetHeader><SheetTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-amber-500" /> كشف حساب - {statementSupplier.name}</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white">
                  <p className="text-sm opacity-80">الرصيد الحالي</p>
                  <p className="text-3xl font-black">{formatCurrency(statementSupplier.balance)}</p>
                  <p className="text-xs opacity-70 mt-1">{statementSupplier.balance > 0 ? 'مدين علينا' : statementSupplier.balance < 0 ? 'دائن لنا' : 'محدد'}</p>
                </div>
                <div className="rounded-xl glass p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">الهاتف</span><span>{statementSupplier.phone}</span></div>
                  {statementSupplier.email && <div className="flex justify-between"><span className="text-muted-foreground">البريد</span><span>{statementSupplier.email}</span></div>}
                  {statementSupplier.address && <div className="flex justify-between"><span className="text-muted-foreground">العنوان</span><span>{statementSupplier.address}</span></div>}
                </div>
                <h4 className="font-bold mt-4">الحركات</h4>
                <div className="space-y-2">
                  {purchaseOrders.filter((po) => po.supplier_id === statementSupplier.id).map((po) => (
                    <div key={po.id} className="flex items-center justify-between rounded-lg glass p-3">
                      <div>
                        <p className="text-xs font-bold">{po.po_number}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(po.date)}</p>
                      </div>
                      <span className="text-sm font-bold text-red-400">- {formatCurrency(po.total)}</span>
                    </div>
                  ))}
                  {payments.filter((p) => p.supplier_id === statementSupplier.id).map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg glass p-3">
                      <div>
                        <p className="text-xs font-bold">دفعة</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(p.date)}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">+ {formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SupplierForm({ supplier, onSave, onCancel }: {
  supplier?: Supplier | null;
  onSave: (data: { name: string; phone: string; email: string; address: string; balance: number }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<{ name: string; phone: string; email: string; address: string; balance: number }>({ name: supplier?.name || '', phone: supplier?.phone || '', email: supplier?.email || '', address: supplier?.address || '', balance: supplier?.balance || 0 });
  return (
    <div className="mt-4 space-y-4">
      <div><Label>اسم المورد</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم الشركة أو المورد" /></div>
      <div><Label>رقم الهاتف</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01xxxxxxxxx" /></div>
      <div><Label>البريد الإلكتروني</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" dir="ltr" /></div>
      <div><Label>العنوان</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="العنوان التفصيلي" /></div>
      <div><Label>الرصيد الافتتاحي</Label><Input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} /><p className="text-[10px] text-muted-foreground mt-1">موجب = مدين علينا، سالب = دائن لنا</p></div>
      <div className="flex gap-2 pt-4">
        <Button variant="glass" className="flex-1" onClick={onCancel}>إلغاء</Button>
        <Button variant="gold" className="flex-1" onClick={() => { if (!form.name) { toast.error('يرجى إدخال الاسم'); return; } onSave(form); }}><Save className="h-5 w-5" /> حفظ</Button>
      </div>
    </div>
  );
}
