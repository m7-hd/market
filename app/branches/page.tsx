'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Store, MapPin, Phone, Edit2, Trash2,
  Warehouse, Star, Save, X, Search, Network,
} from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { cn, initials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PageHeader, EmptyState } from '@/components/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { toast } from 'sonner';
import type { Branch } from '@/types';

export default function BranchesPage() {
  const { branches, warehouses, employees, products } = useDataStore();
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({ name: '', code: '', address: '', phone: '', is_main: false });

  const filtered = branches.filter((b) => b.name.includes(search) || b.code.includes(search) || (b.address || '').includes(search));

  const mainBranches = branches.filter((b) => b.is_main).length;
  const totalWarehouses = warehouses.length;
  const totalStaff = employees.length;

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', code: '', address: '', phone: '', is_main: false });
    setSheetOpen(true);
  };

  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({ name: b.name, code: b.code, address: b.address || '', phone: b.phone || '', is_main: b.is_main });
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.code) {
      toast.error('يرجى إدخال الاسم والكود');
      return;
    }
    if (editing) {
      toast.success('تم تحديث الفرع');
    } else {
      toast.success('تم إضافة فرع جديد');
    }
    setSheetOpen(false);
  };

  const handleDelete = (b: Branch) => {
    if (b.is_main) {
      toast.error('لا يمكن حذف الفرع الرئيسي');
      return;
    }
    toast.success(`تم حذف الفرع: ${b.name}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Building2}
        title="إدارة الفروع والمخازن"
        description="فروع المتجر، المخازن المرتبطة والتوزيع الجغرافي"
        gradient="from-slate-500 via-gray-600 to-zinc-700"
        action={
          <Button variant="luxury" onClick={openAdd}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة فرع
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي الفروع" value={String(branches.length)} icon={Store} gradient="from-slate-500 to-gray-600" />
        <StatCard label="الفروع الرئيسية" value={String(mainBranches)} icon={Star} gradient="from-amber-500 to-orange-600" />
        <StatCard label="إجمالي المخازن" value={String(totalWarehouses)} icon={Warehouse} gradient="from-blue-500 to-indigo-600" />
        <StatCard label="إجمالي الموظفين" value={String(totalStaff)} icon={Network} gradient="from-emerald-500 to-green-600" />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث عن فرع..." className="pr-10" />
      </div>

      {/* Branch cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((b, i) => {
            const branchWarehouses = warehouses.filter((w) => w.branch_id === b.id);
            const branchStaff = employees.filter((e) => e.branch_id === b.id);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={cn('p-5 hover:scale-[1.02] transition-transform duration-300 group', b.is_main && 'border-amber-500/30')}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      'flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-white text-lg shrink-0 shadow-lg',
                      b.is_main ? 'bg-gradient-to-br from-amber-400 to-yellow-600' : 'bg-gradient-to-br from-slate-600 to-gray-800'
                    )}>
                      {initials(b.name)}
                    </div>
                    {b.is_main && <Badge variant="gold"><Star className="h-3 w-3 ml-1" />رئيسي</Badge>}
                  </div>

                  <h3 className="font-bold text-lg mb-1">{b.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">كود: {b.code}</p>

                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />{b.address || 'غير محدد'}
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />{b.phone || 'غير محدد'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="glass rounded-lg p-2 text-center">
                      <Warehouse className="h-4 w-4 mx-auto text-blue-400 mb-1" />
                      <p className="text-xs text-muted-foreground">مخازن</p>
                      <p className="font-bold">{branchWarehouses.length}</p>
                    </div>
                    <div className="glass rounded-lg p-2 text-center">
                      <Network className="h-4 w-4 mx-auto text-emerald-400 mb-1" />
                      <p className="text-xs text-muted-foreground">موظفين</p>
                      <p className="font-bold">{branchStaff.length}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(b)}>
                      <Edit2 className="h-3.5 w-3.5 ml-1" />تعديل
                    </Button>
                    {!b.is_main && (
                      <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleDelete(b)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && <EmptyState icon={Building2} title="لا توجد فروع" description="لم يتم العثور على فروع" />}

      {/* Warehouses section */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Warehouse className="h-5 w-5 text-blue-400" />
          المخازن
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {warehouses.map((w, i) => {
            const branch = branches.find((b) => b.id === w.branch_id);
            const stockItems = products.length;
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl text-white',
                    w.type === 'main' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  )}>
                    <Warehouse className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{w.name}</p>
                    <Badge variant={w.type === 'main' ? 'gold' : 'outline'} className="mt-0.5">{w.type === 'main' ? 'رئيسي' : 'فرعي'}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Store className="h-3 w-3" />{branch?.name || 'غير محدد'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stockItems} صنف مخزون</p>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Add/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? 'تعديل فرع' : 'إضافة فرع جديد'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6 overflow-y-auto pb-20">
            <div className="space-y-2">
              <Label>اسم الفرع *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: فرع المعادي" />
            </div>
            <div className="space-y-2">
              <Label>الكود *</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="MAADI" className="uppercase" />
            </div>
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="العنوان الكامل" />
            </div>
            <div className="space-y-2">
              <Label>الهاتف</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="02xxxxxxxx" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_main} onChange={(e) => setForm({ ...form, is_main: e.target.checked })} className="w-4 h-4 accent-amber-500" />
              <span className="text-sm">الفرع الرئيسي</span>
            </label>
            <div className="flex gap-3 pt-4">
              <Button variant="luxury" className="flex-1" onClick={handleSave}>
                <Save className="h-4 w-4 ml-2" />حفظ
              </Button>
              <Button variant="outline" onClick={() => setSheetOpen(false)}>
                <X className="h-4 w-4 ml-2" />إلغاء
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
