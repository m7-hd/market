'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Plus, Search, Edit2, Trash2, Phone, Mail, MapPin,
  DollarSign, FileText, Gift, Star, ShoppingBag, Save, Cake,
  TrendingUp, CreditCard,
} from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { cn, formatCurrency, formatNumber, formatDate, uid } from '@/lib/utils';
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
import type { Customer, LoyaltyTier } from '@/types';

const tierColors: Record<LoyaltyTier, string> = {
  bronze: 'from-amber-700 to-yellow-800',
  silver: 'from-gray-400 to-gray-500',
  gold: 'from-gold-400 to-gold-600',
  platinum: 'from-gray-300 to-slate-400',
  vip: 'from-purple-500 to-fuchsia-600',
};

const tierLabels: Record<LoyaltyTier, string> = {
  bronze: 'برونزي', silver: 'فضي', gold: 'ذهبي', platinum: 'بلاتيني', vip: 'VIP',
};

export default function CustomersPage() {
  const { customers, invoices, addCustomer, updateCustomer, deleteCustomer } = useDataStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [profileCustomer, setProfileCustomer] = useState<Customer | null>(null);

  const filtered = useMemo(() => customers.filter((c) => !search || c.name.includes(search) || c.phone.includes(search)), [customers, search]);
  const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0);
  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const vipCount = customers.filter((c) => c.loyalty_tier === 'vip' || c.loyalty_tier === 'platinum').length;

  const handleSave = (data: { name: string; phone: string; email: string; address: string; balance: number; debt: number; points: number; loyalty_tier: LoyaltyTier; birthday: string; total_orders: number; total_spent: number }) => {
    if (editCustomer) { updateCustomer(editCustomer.id, data); toast.success('تم تحديث العميل'); }
    else { addCustomer(data as Omit<Customer, 'id' | 'created_at'>); toast.success('تم إضافة العميل'); }
    setShowForm(false); setEditCustomer(null);
  };

  const customerInvoices = (id: string) => invoices.filter((inv) => inv.customer_id === id);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="إدارة العملاء"
        description="ملف العميل، الرصيد، الديون، كشف الحساب، النقاط والكوبونات"
        gradient="from-cyan-500 to-blue-500"
        action={<Button size="lg" onClick={() => { setEditCustomer(null); setShowForm(true); }} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"><Plus className="h-5 w-5" /> عميل جديد</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي العملاء" value={customers.length} icon={Users} gradient="from-cyan-500 to-blue-500" />
        <StatCard label="إجمالي الديون" value={formatCurrency(totalDebt)} icon={CreditCard} gradient="from-red-500 to-pink-500" isCurrency />
        <StatCard label="إجمالي النقاط" value={formatNumber(totalPoints)} icon={Star} gradient="from-gold-400 to-gold-600" />
        <StatCard label="عملاء VIP" value={vipCount} icon={Gift} gradient="from-purple-500 to-fuchsia-600" />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف..." className="pr-10" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="p-4 hover:shadow-glow-orange transition-all cursor-pointer" >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white font-black shadow-lg', tierColors[c.loyalty_tier])}>
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{c.name}</h3>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone}</p>
                  </div>
                </div>
                <Badge className={cn('text-[9px] bg-gradient-to-r text-white border-0', tierColors[c.loyalty_tier])}>{tierLabels[c.loyalty_tier]}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="rounded-lg glass p-2">
                  <p className="text-[9px] text-muted-foreground">النقاط</p>
                  <p className="text-xs font-black text-gold-400">{formatNumber(c.points)}</p>
                </div>
                <div className="rounded-lg glass p-2">
                  <p className="text-[9px] text-muted-foreground">الطلبات</p>
                  <p className="text-xs font-black">{c.total_orders}</p>
                </div>
                <div className="rounded-lg glass p-2">
                  <p className="text-[9px] text-muted-foreground">الديون</p>
                  <p className={cn('text-xs font-black', c.debt > 0 ? 'text-red-400' : 'text-muted-foreground')}>{formatCurrency(c.debt)}</p>
                </div>
              </div>
              {c.birthday && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-2"><Cake className="h-3 w-3 text-pink-400" /> {formatDate(c.birthday)}</p>
              )}
              <p className="text-[10px] text-muted-foreground mb-3">إجمالي المشتريات: <span className="font-bold text-emerald-400">{formatCurrency(c.total_spent)}</span></p>
              <div className="flex gap-1">
                <Button size="sm" variant="glass" className="flex-1" onClick={() => setProfileCustomer(c)}><FileText className="h-3 w-3" /> ملف</Button>
                <Button size="iconSm" variant="ghost" onClick={() => { setEditCustomer(c); setShowForm(true); }}><Edit2 className="h-3.5 w-3.5 text-blue-400" /></Button>
                <Button size="iconSm" variant="ghost" onClick={() => { if (confirm('حذف هذا العميل؟')) { deleteCustomer(c.id); toast.success('تم حذف العميل'); } }}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon={Users} title="لا يوجد عملاء" description="ابدأ بإضافة عملاء" />}

      {/* Form */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="left" className="w-[440px]">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-cyan-400" /> {editCustomer ? 'تعديل عميل' : 'عميل جديد'}</SheetTitle></SheetHeader>
          <CustomerForm customer={editCustomer} onSave={handleSave} onCancel={() => setShowForm(false)} />
        </SheetContent>
      </Sheet>

      {/* Profile */}
      <Sheet open={!!profileCustomer} onOpenChange={(o) => !o && setProfileCustomer(null)}>
        <SheetContent side="left" className="w-[560px] overflow-y-auto">
          {profileCustomer && (
            <>
              <SheetHeader><SheetTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-cyan-400" /> ملف العميل</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-4">
                {/* Profile Header */}
                <div className={cn('rounded-2xl bg-gradient-to-br p-6 text-white text-center', tierColors[profileCustomer.loyalty_tier])}>
                  <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-black backdrop-blur">
                    {profileCustomer.name.charAt(0)}
                  </div>
                  <h2 className="text-xl font-black">{profileCustomer.name}</h2>
                  <p className="text-sm opacity-80">{profileCustomer.phone}</p>
                  <Badge className={cn('mt-2 bg-white/20 text-white border-0')}>{tierLabels[profileCustomer.loyalty_tier]} ★</Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 text-center"><Star className="h-5 w-5 text-gold-400 mx-auto mb-1" /><p className="text-xs text-muted-foreground">النقاط</p><p className="text-lg font-black text-gold-400">{formatNumber(profileCustomer.points)}</p></Card>
                  <Card className="p-3 text-center"><ShoppingBag className="h-5 w-5 text-blue-400 mx-auto mb-1" /><p className="text-xs text-muted-foreground">الطلبات</p><p className="text-lg font-black">{profileCustomer.total_orders}</p></Card>
                  <Card className="p-3 text-center"><DollarSign className="h-5 w-5 text-emerald-400 mx-auto mb-1" /><p className="text-xs text-muted-foreground">إجمالي المشتريات</p><p className="text-lg font-black text-emerald-400">{formatCurrency(profileCustomer.total_spent)}</p></Card>
                  <Card className="p-3 text-center"><CreditCard className="h-5 w-5 text-red-400 mx-auto mb-1" /><p className="text-xs text-muted-foreground">الديون</p><p className={cn('text-lg font-black', profileCustomer.debt > 0 ? 'text-red-400' : 'text-muted-foreground')}>{formatCurrency(profileCustomer.debt)}</p></Card>
                </div>

                {/* Info */}
                <Card className="p-4 space-y-2 text-sm">
                  {profileCustomer.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {profileCustomer.email}</div>}
                  {profileCustomer.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {profileCustomer.address}</div>}
                  {profileCustomer.birthday && <div className="flex items-center gap-2"><Cake className="h-4 w-4 text-pink-400" /> {formatDate(profileCustomer.birthday)}</div>}
                  <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-400" /> الرصيد: {formatCurrency(profileCustomer.balance)}</div>
                </Card>

                {/* Recent Invoices */}
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-cyan-400" /> آخر المشتريات</h4>
                  <div className="space-y-2">
                    {customerInvoices(profileCustomer.id).slice(0, 5).map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between rounded-lg glass p-3">
                        <div>
                          <p className="text-xs font-bold">{inv.invoice_number}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(inv.created_at, true)}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gradient-luxury">{formatCurrency(inv.total)}</p>
                          <p className="text-[10px] text-muted-foreground">{inv.items.length} منتج</p>
                        </div>
                      </div>
                    ))}
                    {customerInvoices(profileCustomer.id).length === 0 && <p className="text-center text-sm text-muted-foreground py-4">لا توجد مشتريات</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CustomerForm({ customer, onSave, onCancel }: {
  customer?: Customer | null;
  onSave: (data: { name: string; phone: string; email: string; address: string; balance: number; debt: number; points: number; loyalty_tier: LoyaltyTier; birthday: string; total_orders: number; total_spent: number }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<{
    name: string; phone: string; email: string; address: string; balance: number; debt: number;
    points: number; loyalty_tier: LoyaltyTier; birthday: string; total_orders: number; total_spent: number;
  }>({
    name: customer?.name || '', phone: customer?.phone || '', email: customer?.email || '',
    address: customer?.address || '', balance: customer?.balance || 0, debt: customer?.debt || 0,
    points: customer?.points || 0, loyalty_tier: customer?.loyalty_tier || 'bronze',
    birthday: customer?.birthday || '', total_orders: customer?.total_orders || 0, total_spent: customer?.total_spent || 0,
  });
  return (
    <div className="mt-4 space-y-4">
      <div><Label>اسم العميل</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div><Label>رقم الهاتف</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01xxxxxxxxx" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>البريد الإلكتروني</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} dir="ltr" /></div>
        <div><Label>تاريخ الميلاد</Label><Input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} /></div>
      </div>
      <div><Label>العنوان</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>الرصيد</Label><Input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} /></div>
        <div><Label>الديون</Label><Input type="number" value={form.debt} onChange={(e) => setForm({ ...form, debt: parseFloat(e.target.value) || 0 })} /></div>
        <div><Label>النقاط</Label><Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })} /></div>
      </div>
      <div>
        <Label>مستوى الولاء</Label>
        <Select value={form.loyalty_tier} onValueChange={(v) => setForm({ ...form, loyalty_tier: v as LoyaltyTier })}>
          <Select.Trigger><Select.Value /></Select.Trigger>
          <Select.Content>
            <Select.Item value="bronze">برونزي</Select.Item>
            <Select.Item value="silver">فضي</Select.Item>
            <Select.Item value="gold">ذهبي</Select.Item>
            <Select.Item value="platinum">بلاتيني</Select.Item>
            <Select.Item value="vip">VIP</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <div className="flex gap-2 pt-4">
        <Button variant="glass" className="flex-1" onClick={onCancel}>إلغاء</Button>
        <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white" onClick={() => { if (!form.name) { toast.error('يرجى إدخال الاسم'); return; } onSave(form); }}><Save className="h-5 w-5" /> حفظ</Button>
      </div>
    </div>
  );
}
