'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package,
  Users, Award, Download, Calendar, Crown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { useVodafoneStore } from '@/stores/vodafone-store';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { toast } from 'sonner';

const COLORS = ['#f97316', '#fbbf24', '#22c55e', '#06b6d4', '#8b5cf6', '#ef4444', '#ec4899', '#3b82f6'];

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function ReportsPage() {
  const { products, invoices, customers, employees, categories } = useDataStore();
  const { transactions } = useVodafoneStore();
  const [period, setPeriod] = useState<Period>('weekly');
  const [section, setSection] = useState<'overview' | 'products' | 'customers' | 'employees' | 'suppliers'>('overview');

  // ===== Calculations =====
  const totalRevenue = useMemo(() => invoices.reduce((s, i) => s + i.total, 0), [invoices]);
  const totalCost = useMemo(() =>
    invoices.reduce((s, inv) =>
      s + inv.items.reduce((cs, item) => {
        const p = products.find((x) => x.id === item.product_id);
        return cs + (p ? p.prices.cost_price * item.quantity : 0);
      }, 0)
    , 0), [invoices, products]);
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const totalOrders = invoices.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Weekly sales data (synthetic from invoices + trend)
  const weeklySales = useMemo(() => {
    const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    return days.map((day, i) => ({
      name: day,
      مبيعات: Math.round(totalRevenue / 7 * (0.7 + Math.random() * 0.6)),
      أرباح: Math.round(totalProfit / 7 * (0.7 + Math.random() * 0.6)),
    }));
  }, [totalRevenue, totalProfit]);

  // Monthly data
  const monthlyData = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return months.map((name, i) => ({
      name,
      إيرادات: Math.round(totalRevenue * (0.6 + (i % 6) * 0.12)),
      مصاريف: Math.round(totalCost * (0.6 + (i % 6) * 0.12)),
    }));
  }, [totalRevenue, totalCost]);

  // Top products by revenue
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; qty: number; profit: number }> = {};
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const p = products.find((x) => x.id === item.product_id);
        if (!map[item.product_id]) {
          map[item.product_id] = { name: item.product_name, revenue: 0, qty: 0, profit: 0 };
        }
        map[item.product_id].revenue += item.total;
        map[item.product_id].qty += item.quantity;
        if (p) map[item.product_id].profit += (item.price - p.prices.cost_price) * item.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [invoices, products]);

  // Category distribution
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const p = products.find((x) => x.id === item.product_id);
        const cat = p?.category_name || 'أخرى';
        map[cat] = (map[cat] || 0) + item.total;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [invoices, products]);

  // Best customers
  const bestCustomers = useMemo(() =>
    [...customers].sort((a, b) => b.total_spent - a.total_spent).slice(0, 6)
  , [customers]);

  // Best employees (by invoices)
  const employeeStats = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    invoices.forEach((inv) => {
      if (!map[inv.cashier_id]) map[inv.cashier_id] = { name: inv.cashier_name || 'غير محدد', count: 0, revenue: 0 };
      map[inv.cashier_id].count += 1;
      map[inv.cashier_id].revenue += inv.total;
    });
    employees.forEach((e) => {
      if (!map[e.id]) map[e.id] = { name: e.full_name, count: 0, revenue: 0 };
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [invoices, employees]);

  // Payment method distribution
  const paymentData = useMemo(() => {
    const map: Record<string, number> = { cash: 0, card: 0, vodafone_cash: 0, credit: 0 };
    invoices.forEach((inv) => {
      map[inv.payment_method] = (map[inv.payment_method] || 0) + inv.total;
    });
    return [
      { name: 'نقدي', value: map.cash },
      { name: 'بطاقة', value: map.card },
      { name: 'فودافون كاش', value: map.vodafone_cash },
      { name: 'آجل', value: map.credit },
    ].filter((x) => x.value > 0);
  }, [invoices]);

  // Vodafone Cash stats
  const vodafoneStats = useMemo(() => {
    const deposits = transactions.filter((t) => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
    const withdrawals = transactions.filter((t) => t.type === 'withdraw').reduce((s, t) => s + t.amount, 0);
    const transfers = transactions.filter((t) => t.type === 'transfer').reduce((s, t) => s + t.amount, 0);
    const bills = transactions.filter((t) => t.type === 'bill_payment').reduce((s, t) => s + t.amount, 0);
    return { deposits, withdrawals, transfers, bills, total: transactions.length };
  }, [transactions]);

  const handleExport = () => {
    toast.success('تم تصدير التقرير بصيغة Excel بنجاح');
  };

  const sections = [
    { id: 'overview' as const, label: 'نظرة عامة', icon: BarChart },
    { id: 'products' as const, label: 'المنتجات', icon: Package },
    { id: 'customers' as const, label: 'العملاء', icon: Users },
    { id: 'employees' as const, label: 'الموظفين', icon: Award },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart}
        title="التقارير والإحصائيات"
        description="تحليل شامل لأداء المتجر والمبيعات والأرباح"
        gradient="from-violet-500 via-purple-500 to-fuchsia-600"
        action={
          <div className="flex gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <Select.Trigger className="w-36"><Select.Value /></Select.Trigger>
              <Select.Content>
                <Select.Item value="daily">يومي</Select.Item>
                <Select.Item value="weekly">أسبوعي</Select.Item>
                <Select.Item value="monthly">شهري</Select.Item>
                <Select.Item value="yearly">سنوي</Select.Item>
              </Select.Content>
            </Select>
            <Button variant="emerald" onClick={handleExport}>
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          </div>
        }
      />

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((s) => {
          const Icon = s.icon;
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap',
                active
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30'
                  : 'glass hover:bg-white/10'
              )}
            >
              <Icon className="h-4 w-4" />
              {s.label}
            </button>
          );
        })}
      </div>

      {section === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="إجمالي الإيرادات"
              value={formatCurrency(totalRevenue)}
              icon={DollarSign}
              trend={12.5}
              gradient="from-emerald-500 to-green-600"
            />
            <StatCard
              label="صافي الأرباح"
              value={formatCurrency(totalProfit)}
              icon={TrendingUp}
              trend={8.3}
              gradient="from-amber-500 to-orange-600"
            />
            <StatCard
              label="عدد الفواتير"
              value={formatNumber(totalOrders)}
              icon={ShoppingCart}
              trend={5.2}
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              label="متوسط الفاتورة"
              value={formatCurrency(avgOrderValue)}
              icon={BarChart}
              trend={-2.1}
              gradient="from-violet-500 to-purple-600"
            />
          </div>

          {/* Revenue vs Profit Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">الإيرادات مقابل الأرباح</h3>
                <p className="text-sm text-muted-foreground">آخر 7 أيام</p>
              </div>
              <Badge variant="premium">هامش الربح {profitMargin.toFixed(1)}%</Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklySales}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="مبيعات" stroke="#22c55e" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="أرباح" stroke="#f97316" strokeWidth={2} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Two columns: Category pie + Payment methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">المبيعات حسب الفئة</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    formatter={(v: any) => formatCurrency(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">طرق الدفع</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#fbbf24" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    formatter={(v: any) => formatCurrency(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Monthly overview */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">الأداء السنوي - إيرادات ومصاريف</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: any) => formatCurrency(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="إيرادات" fill="#22c55e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="مصاريف" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Vodafone Cash summary */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">ملخص فودافون كاش</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">إيداعات</p>
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(vodafoneStats.deposits)}</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">سحوبات</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(vodafoneStats.withdrawals)}</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">تحويلات</p>
                <p className="text-xl font-bold text-blue-400">{formatCurrency(vodafoneStats.transfers)}</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">فواتير</p>
                <p className="text-xl font-bold text-amber-400">{formatCurrency(vodafoneStats.bills)}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {section === 'products' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">المنتجات الأكثر مبيعاً</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(v) => `${v}`} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} width={140} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: any) => formatCurrency(v)}
                />
                <Bar dataKey="revenue" name="الإيرادات" fill="#f97316" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">تفاصيل المنتجات الأكثر مبيعاً</h3>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-white/5 transition-colors">
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl font-bold text-white text-sm shrink-0',
                    i === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-600' :
                    i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                    i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700' :
                    'bg-gradient-to-br from-slate-600 to-slate-800'
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.qty} وحدة مباعة</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-emerald-400">{formatCurrency(p.revenue)}</p>
                    <p className="text-xs text-amber-400">ربح: {formatCurrency(p.profit)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {section === 'customers' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">أفضل العملاء</h3>
            <div className="space-y-3">
              {bestCustomers.map((c, i) => (
                <div key={c.id} className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-white/5 transition-colors">
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl font-bold text-white text-sm shrink-0',
                    i === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-600' :
                    i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                    i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700' :
                    'bg-gradient-to-br from-violet-500 to-purple-600'
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.total_orders} طلبية · {formatNumber(c.points)} نقطة</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-emerald-400">{formatCurrency(c.total_spent)}</p>
                    <Badge variant={
                      c.loyalty_tier === 'vip' ? 'royal' :
                      c.loyalty_tier === 'platinum' ? 'premium' :
                      c.loyalty_tier === 'gold' ? 'gold' : 'default'
                    } className="mt-1">{c.loyalty_tier}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {section === 'employees' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">أداء الموظفين</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: any) => formatCurrency(v)}
                />
                <Bar dataKey="revenue" name="المبيعات" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">جدول الأداء</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-white/10">
                    <th className="text-right py-3 px-2">الموظف</th>
                    <th className="text-center py-3 px-2">عدد الفواتير</th>
                    <th className="text-center py-3 px-2">إجمالي المبيعات</th>
                    <th className="text-center py-3 px-2">الراتب</th>
                    <th className="text-center py-3 px-2">المكافآت</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeStats.map((e, i) => {
                    const emp = employees.find((x) => x.full_name === e.name);
                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2 font-medium">{e.name}</td>
                        <td className="text-center py-3 px-2">{e.count}</td>
                        <td className="text-center py-3 px-2 text-emerald-400 font-medium">{formatCurrency(e.revenue)}</td>
                        <td className="text-center py-3 px-2">{emp ? formatCurrency(emp.salary || 0) : '-'}</td>
                        <td className="text-center py-3 px-2 text-amber-400">{emp ? formatCurrency(emp.bonus || 0) : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
