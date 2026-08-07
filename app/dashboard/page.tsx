'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import {
  ShoppingCart, DollarSign, TrendingUp, Users, Package, Smartphone,
  Gift, AlertTriangle, ArrowUpRight, Wallet, Receipt, Boxes,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const salesData = [
  { name: 'السبت', sales: 12400, profit: 3100 },
  { name: 'الأحد', sales: 9800, profit: 2400 },
  { name: 'الإثنين', sales: 15200, profit: 3800 },
  { name: 'الثلاثاء', sales: 18700, profit: 4600 },
  { name: 'الأربعاء', sales: 14300, profit: 3500 },
  { name: 'الخميس', sales: 22100, profit: 5500 },
  { name: 'الجمعة', sales: 28400, profit: 7100 },
];

const categoryData = [
  { name: 'مواد غذائية', value: 45, color: '#f97316' },
  { name: 'مشروبات', value: 22, color: '#10b981' },
  { name: 'منظفات', value: 15, color: '#7c3aed' },
  { name: 'ألبان', value: 12, color: '#fbbf24' },
  { name: 'أخرى', value: 6, color: '#e60000' },
];

const topProducts = [
  { name: 'أرز مصري 5كجم', sales: 342, revenue: 47880 },
  { name: 'زيت عافية 1لتر', sales: 289, revenue: 8640 },
  { name: 'سكر 1كجم', sales: 256, revenue: 3580 },
  { name: 'شاي العروسة', sales: 198, revenue: 5940 },
  { name: 'مكرونة 400جم', sales: 175, revenue: 1575 },
];

const radialData = [
  { name: 'المبيعات', value: 78, fill: '#f97316' },
];

export default function DashboardPage() {
  return (
    <DashboardLayout title="لوحة التحكم">
      {/* Hero welcome */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl mb-6 p-8 glass-strong"
      >
        <div className="absolute inset-0 bg-gradient-luxury opacity-10" />
        <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-brand-500/30 blur-3xl animate-pulse-glow" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-black mb-2">
              أهلاً بك في <span className="text-gradient-luxury">محمـد ماركت</span> 👋
            </h2>
            <p className="text-muted-foreground">إليك ملخص أداء متجرك اليوم · {new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="luxury" size="lg" onClick={() => window.location.href = '/pos'}>
              <ShoppingCart className="h-5 w-5" />
              فتح الكاشير
            </Button>
            <Button variant="vodafone" size="lg" onClick={() => window.location.href = '/vodafone-cash'}>
              <Smartphone className="h-5 w-5" />
              فودافون كاش
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="مبيعات اليوم" value={28400} suffix=" ج.م" icon={<DollarSign className="h-6 w-6" />} trend={18.5} trendLabel="عن أمس" gradient="orange" delay={0} />
        <StatCard title="أرباح اليوم" value={7100} suffix=" ج.م" icon={<TrendingUp className="h-6 w-6" />} trend={12.3} trendLabel="عن أمس" gradient="emerald" delay={0.1} />
        <StatCard title="عدد الفواتير" value={187} icon={<Receipt className="h-6 w-6" />} trend={8.2} trendLabel="عن أمس" gradient="gold" delay={0.2} />
        <StatCard title="فودافون كاش" value={15420} suffix=" ج.م" icon={<Wallet className="h-6 w-6" />} trend={-3.4} trendLabel="عن أمس" gradient="vodafone" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales chart - 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>المبيعات والأرباح الأسبوعية</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">آخر 7 أيام</p>
            </div>
            <Badge variant="success">
              <ArrowUpRight className="h-3 w-3" />
              +18.5%
            </Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fill="url(#salesGrad)" name="المبيعات" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fill="url(#profitGrad)" name="الأرباح" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categories pie */}
        <Card>
          <CardHeader>
            <CardTitle>المبيعات حسب الفئة</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">توزيع هذا الأسبوع</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="font-bold mr-auto">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>أكثر المنتجات مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/40 transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-white ${
                    i === 0 ? 'bg-gradient-gold' : i === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' : i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sales} قطعة مباعة</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gradient-luxury">{p.revenue.toLocaleString('ar-EG')} ج.م</p>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.sales / 342) * 100}%` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                      className="h-full bg-gradient-luxury rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & quick stats */}
        <div className="space-y-4">
          {/* Low stock alert */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">تنبيهات المخزون</CardTitle>
              <Badge variant="warning">
                <AlertTriangle className="h-3 w-3" />
                5 منتجات
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {['أرز مصري 5كجم', 'سكر 1كجم', 'زيت عافية', 'شاي العروسة'].map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-amber-500/10">
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-amber-500" />
                      {p}
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {Math.floor(Math.random() * 5) + 1} قطع
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loyalty radial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="h-5 w-5 text-gold-500" />
                هدف المبيعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar background dataKey="value" cornerRadius={20} fill="#f97316" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center -mt-24 mb-12">
                <p className="text-3xl font-black text-gradient-luxury">78%</p>
                <p className="text-xs text-muted-foreground">من الهدف الشهري</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
