'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, Shield, Fingerprint, Clock, DollarSign,
  Award, TrendingDown, Wallet, Edit2, Trash2, CheckCircle2, AlertCircle,
  Lock, KeyRound, Save, X, ScrollText, Calendar,
} from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { useAuthStore, ALL_PERMISSIONS, ROLE_PERMISSIONS } from '@/stores/auth-store';
import { cn, formatCurrency, formatDate, formatTime, initials } from '@/lib/utils';
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
import type { UserProfile, Attendance } from '@/types';

const roleConfig: Record<string, { label: string; color: string; gradient: string }> = {
  admin: { label: 'مدير عام', color: 'text-violet-400', gradient: 'from-violet-500 to-purple-600' },
  manager: { label: 'مدير', color: 'text-blue-400', gradient: 'from-blue-500 to-indigo-600' },
  cashier: { label: 'كاشير', color: 'text-emerald-400', gradient: 'from-emerald-500 to-green-600' },
  warehouse: { label: 'أمين مخزن', color: 'text-amber-400', gradient: 'from-amber-500 to-orange-600' },
  accountant: { label: 'محاسب', color: 'text-cyan-400', gradient: 'from-cyan-500 to-teal-600' },
};

const permissionLabels: Record<string, string> = {
  'dashboard.view': 'عرض لوحة التحكم',
  'pos.use': 'استخدام نقطة البيع',
  'pos.refund': 'مرتجعات نقطة البيع',
  'pos.discount': 'خصومات نقطة البيع',
  'vodafone.view': 'عرض فودافون كاش',
  'vodafone.deposit': 'إيداع فودافون',
  'vodafone.withdraw': 'سحب فودافون',
  'vodafone.transfer': 'تحويل فودافون',
  'vodafone.bills': 'دفع فواتير فودافون',
  'vodafone.reports': 'تقارير فودافون',
  'products.view': 'عرض المنتجات',
  'products.create': 'إضافة منتجات',
  'products.edit': 'تعديل المنتجات',
  'products.delete': 'حذف المنتجات',
  'inventory.view': 'عرض المخزون',
  'inventory.transfer': 'تحويلات المخزون',
  'inventory.count': 'جرد المخزون',
  'inventory.adjust': 'تعديل المخزون',
  'suppliers.view': 'عرض الموردين',
  'suppliers.create': 'إضافة موردين',
  'suppliers.payments': 'مدفوعات الموردين',
  'customers.view': 'عرض العملاء',
  'customers.create': 'إضافة عملاء',
  'customers.edit': 'تعديل العملاء',
  'offers.manage': 'إدارة العروض',
  'loyalty.manage': 'إدارة الولاء',
  'orders.view': 'عرض الطلبات',
  'orders.manage': 'إدارة الطلبات',
  'reports.view': 'عرض التقارير',
  'employees.view': 'عرض الموظفين',
  'employees.manage': 'إدارة الموظفين',
  'settings.manage': 'إدارة الإعدادات',
  'notifications.send': 'إرسال إشعارات',
};

type Tab = 'list' | 'attendance' | 'salaries' | 'audit';

export default function EmployeesPage() {
  const { employees, attendance, auditLogs, branches, addEmployee, updateEmployee, deleteEmployee } = useDataStore();
  const { hasPermission } = useAuthStore();
  const [tab, setTab] = useState<Tab>('list');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [permTarget, setPermTarget] = useState<UserProfile | null>(null);

  // Form state
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', role: 'cashier' as UserProfile['role'],
    branch_id: '', salary: 0, bonus: 0, deductions: 0, custody: 0,
    two_factor_enabled: false, is_active: true,
  });

  const filtered = useMemo(() =>
    employees.filter((e) => {
      const matchSearch = e.full_name.includes(search) || e.phone.includes(search) || (e.email || '').includes(search);
      const matchRole = roleFilter === 'all' || e.role === roleFilter;
      return matchSearch && matchRole;
    })
  , [employees, search, roleFilter]);

  const totalSalaries = useMemo(() => employees.reduce((s, e) => s + (e.salary || 0), 0), [employees]);
  const totalBonuses = useMemo(() => employees.reduce((s, e) => s + (e.bonus || 0), 0), [employees]);
  const totalDeductions = useMemo(() => employees.reduce((s, e) => s + (e.deductions || 0), 0), [employees]);
  const totalCustody = useMemo(() => employees.reduce((s, e) => s + (e.custody || 0), 0), [employees]);

  const openAdd = () => {
    setEditing(null);
    setForm({ full_name: '', phone: '', email: '', role: 'cashier', branch_id: branches[0]?.id || '', salary: 0, bonus: 0, deductions: 0, custody: 0, two_factor_enabled: false, is_active: true });
    setSheetOpen(true);
  };

  const openEdit = (e: UserProfile) => {
    setEditing(e);
    setForm({
      full_name: e.full_name, phone: e.phone, email: e.email || '', role: e.role,
      branch_id: e.branch_id || '', salary: e.salary || 0, bonus: e.bonus || 0,
      deductions: e.deductions || 0, custody: e.custody || 0,
      two_factor_enabled: e.two_factor_enabled || false, is_active: e.is_active ?? true,
    });
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!form.full_name || !form.phone) {
      toast.error('يرجى إدخال الاسم ورقم الهاتف');
      return;
    }
    if (editing) {
      updateEmployee(editing.id, form);
      toast.success('تم تحديث بيانات الموظف');
    } else {
      addEmployee(form);
      toast.success('تم إضافة موظف جديد');
    }
    setSheetOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    deleteEmployee(id);
    toast.success(`تم حذف الموظف: ${name}`);
  };

  const tabs = [
    { id: 'list' as const, label: 'الموظفون', icon: Users },
    { id: 'attendance' as const, label: 'الحضور والانصراف', icon: Clock },
    { id: 'salaries' as const, label: 'الرواتب', icon: DollarSign },
    { id: 'audit' as const, label: 'سجل التدقيق', icon: ScrollText },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="إدارة الموظفين"
        description="الموظفون، الصلاحيات، الحضور، الرواتب وسجل التدقيق"
        gradient="from-cyan-500 via-blue-500 to-indigo-600"
        action={
          <Button variant="luxury" onClick={openAdd}>
            <UserPlus className="h-4 w-4 ml-2" />
            إضافة موظف
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي الموظفين" value={String(employees.length)} icon={Users} gradient="from-cyan-500 to-blue-600" />
        <StatCard label="إجمالي الرواتب" value={formatCurrency(totalSalaries)} icon={DollarSign} gradient="from-emerald-500 to-green-600" />
        <StatCard label="إجمالي المكافآت" value={formatCurrency(totalBonuses)} icon={Award} gradient="from-amber-500 to-orange-600" />
        <StatCard label="إجمالي العهد" value={formatCurrency(totalCustody)} icon={Wallet} gradient="from-violet-500 to-purple-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap',
                active ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'glass hover:bg-white/10'
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Employee List */}
      {tab === 'list' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف..." className="pr-10" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <Select.Trigger className="w-40"><Select.Value /></Select.Trigger>
              <Select.Content>
                <Select.Item value="all">كل الأدوار</Select.Item>
                <Select.Item value="admin">مدير عام</Select.Item>
                <Select.Item value="manager">مدير</Select.Item>
                <Select.Item value="cashier">كاشير</Select.Item>
                <Select.Item value="warehouse">أمين مخزن</Select.Item>
                <Select.Item value="accountant">محاسب</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((e, i) => {
              const rc = roleConfig[e.role] || roleConfig.cashier;
              const branch = branches.find((b) => b.id === e.branch_id);
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-5 hover:scale-[1.02] transition-transform duration-300 group">
                    <div className="flex items-start gap-4">
                      <div className={cn('flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br text-white font-bold text-lg shrink-0 shadow-lg', rc.gradient)}>
                        {initials(e.full_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate">{e.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{e.phone}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="outline" className={rc.color}>{rc.label}</Badge>
                          {e.two_factor_enabled && (
                            <Badge variant="success"><Fingerprint className="h-3 w-3 ml-1" />2FA</Badge>
                          )}
                          {!e.is_active && <Badge variant="destructive">غير نشط</Badge>}
                        </div>
                      </div>
                    </div>

                    {branch && <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><Shield className="h-3 w-3" />{branch.name}</p>}

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="glass rounded-lg p-2">
                        <p className="text-muted-foreground">الراتب</p>
                        <p className="font-bold">{formatCurrency(e.salary || 0)}</p>
                      </div>
                      <div className="glass rounded-lg p-2">
                        <p className="text-muted-foreground">العهدة</p>
                        <p className="font-bold">{formatCurrency(e.custody || 0)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(e)}>
                        <Edit2 className="h-3.5 w-3.5 ml-1" />تعديل
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setPermTarget(e); setPermissionsOpen(true); }}>
                        <Lock className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-500" onClick={() => handleDelete(e.id, e.full_name)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          {filtered.length === 0 && <EmptyState icon={Users} title="لا يوجد موظفون" description="لم يتم العثور على موظفين مطابقين" />}
        </motion.div>
      )}

      {/* Attendance */}
      {tab === 'attendance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">سجل الحضور والانصراف</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-white/10">
                    <th className="text-right py-3 px-3">الموظف</th>
                    <th className="text-center py-3 px-3">التاريخ</th>
                    <th className="text-center py-3 px-3">الحضور</th>
                    <th className="text-center py-3 px-3">الانصراف</th>
                    <th className="text-center py-3 px-3">ساعات العمل</th>
                    <th className="text-center py-3 px-3">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 25).map((a) => {
                    const checkIn = new Date(a.check_in);
                    const checkOut = a.check_out ? new Date(a.check_out) : null;
                    const hours = checkOut ? (checkOut.getTime() - checkIn.getTime()) / 3600000 : 0;
                    return (
                      <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-medium">{a.user_name}</td>
                        <td className="text-center py-3 px-3 text-muted-foreground">{formatDate(a.check_in)}</td>
                        <td className="text-center py-3 px-3">{formatTime(a.check_in)}</td>
                        <td className="text-center py-3 px-3">{a.check_out ? formatTime(a.check_out) : '—'}</td>
                        <td className="text-center py-3 px-3">{hours.toFixed(1)} ساعة</td>
                        <td className="text-center py-3 px-3">
                          {a.status === 'present' ? (
                            <Badge variant="success"><CheckCircle2 className="h-3 w-3 ml-1" />حاضر</Badge>
                          ) : (
                            <Badge variant="warning"><AlertCircle className="h-3 w-3 ml-1" />متأخر</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Salaries */}
      {tab === 'salaries' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 text-center">
              <DollarSign className="h-8 w-8 mx-auto text-emerald-400 mb-2" />
              <p className="text-sm text-muted-foreground">إجمالي الرواتب</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSalaries)}</p>
            </Card>
            <Card className="p-5 text-center">
              <Award className="h-8 w-8 mx-auto text-amber-400 mb-2" />
              <p className="text-sm text-muted-foreground">إجمالي المكافآت</p>
              <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalBonuses)}</p>
            </Card>
            <Card className="p-5 text-center">
              <TrendingDown className="h-8 w-8 mx-auto text-red-400 mb-2" />
              <p className="text-sm text-muted-foreground">إجمالي الخصومات</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(totalDeductions)}</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">كشف الرواتب</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-white/10">
                    <th className="text-right py-3 px-3">الموظف</th>
                    <th className="text-center py-3 px-3">الراتب</th>
                    <th className="text-center py-3 px-3">المكافأة</th>
                    <th className="text-center py-3 px-3">الخصم</th>
                    <th className="text-center py-3 px-3">العهدة</th>
                    <th className="text-center py-3 px-3">الصافي</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => {
                    const net = (e.salary || 0) + (e.bonus || 0) - (e.deductions || 0);
                    return (
                      <tr key={e.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-medium">{e.full_name}</td>
                        <td className="text-center py-3 px-3">{formatCurrency(e.salary || 0)}</td>
                        <td className="text-center py-3 px-3 text-amber-400">{formatCurrency(e.bonus || 0)}</td>
                        <td className="text-center py-3 px-3 text-red-400">{formatCurrency(e.deductions || 0)}</td>
                        <td className="text-center py-3 px-3 text-muted-foreground">{formatCurrency(e.custody || 0)}</td>
                        <td className="text-center py-3 px-3 font-bold text-emerald-400">{formatCurrency(net)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Audit Log */}
      {tab === 'audit' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-cyan-400" />
              سجل التدقيق - كل العمليات
            </h3>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-white/5 transition-colors">
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl shrink-0',
                    log.action === 'create' ? 'bg-emerald-500/20 text-emerald-400' :
                    log.action === 'update' ? 'bg-blue-500/20 text-blue-400' :
                    log.action === 'delete' ? 'bg-red-500/20 text-red-400' :
                    'bg-violet-500/20 text-violet-400'
                  )}>
                    {log.action === 'create' ? <UserPlus className="h-5 w-5" /> :
                     log.action === 'update' ? <Edit2 className="h-5 w-5" /> :
                     log.action === 'delete' ? <Trash2 className="h-5 w-5" /> :
                     <KeyRound className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      <span className="text-muted-foreground">{log.user_name}</span>
                      {' — '}
                      <span className={cn(
                        log.action === 'create' ? 'text-emerald-400' :
                        log.action === 'update' ? 'text-blue-400' :
                        log.action === 'delete' ? 'text-red-400' : 'text-violet-400'
                      )}>{log.action}</span>
                      {' '}{log.entity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.ip_address} · {formatDate(log.created_at)} {formatTime(log.created_at)}
                    </p>
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <Badge variant="outline" className="text-xs">{JSON.stringify(log.details).slice(0, 40)}</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Add/Edit Employee Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editing ? 'تعديل موظف' : 'إضافة موظف جديد'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6 overflow-y-auto pb-20">
            <div className="space-y-2">
              <Label>الاسم الكامل *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="مثال: أحمد محمد علي" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>رقم الهاتف *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="010xxxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>الدور</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserProfile['role'] })}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="admin">مدير عام</Select.Item>
                    <Select.Item value="manager">مدير</Select.Item>
                    <Select.Item value="cashier">كاشير</Select.Item>
                    <Select.Item value="warehouse">أمين مخزن</Select.Item>
                    <Select.Item value="accountant">محاسب</Select.Item>
                  </Select.Content>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الفرع</Label>
                <Select value={form.branch_id} onValueChange={(v) => setForm({ ...form, branch_id: v })}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    {branches.map((b) => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}
                  </Select.Content>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>الراتب</Label>
                <Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>المكافأة</Label>
                <Input type="number" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>الخصومات</Label>
                <Input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>العهدة</Label>
                <Input type="number" value={form.custody} onChange={(e) => setForm({ ...form, custody: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.two_factor_enabled} onChange={(e) => setForm({ ...form, two_factor_enabled: e.target.checked })} className="w-4 h-4 accent-violet-500" />
                <span className="text-sm">تفعيل المصادقة الثنائية (2FA)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-emerald-500" />
                <span className="text-sm">حساب نشط</span>
              </label>
            </div>

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

      {/* Permissions Sheet */}
      <Sheet open={permissionsOpen} onOpenChange={setPermissionsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>صلاحيات: {permTarget?.full_name}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-2 overflow-y-auto pb-20">
            <div className="glass rounded-xl p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-2">الدور الحالي: <span className="font-bold text-white">{roleConfig[permTarget?.role || 'cashier'].label}</span></p>
              <p className="text-xs text-muted-foreground">الصلاحيات الافتراضية للدور:</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map((perm) => {
                const has = ROLE_PERMISSIONS[permTarget?.role || 'cashier']?.includes(perm) ?? false;
                return (
                  <div key={perm} className={cn(
                    'flex items-center gap-2 rounded-xl p-3 border transition-all',
                    has ? 'glass border-emerald-500/30' : 'border-white/5 opacity-50'
                  )}>
                    {has ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm">{permissionLabels[perm] || perm}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
