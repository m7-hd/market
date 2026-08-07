'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, Smartphone, Package, Warehouse,
  Truck, Users, Tag, Gift, ClipboardList, BarChart3, UserCog,
  Bell, Settings, ChevronLeft, Building2, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  permission?: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, gradient: 'from-brand-500 to-gold-400', permission: 'dashboard.view' },
  { href: '/pos', label: 'نقطة البيع', icon: ShoppingCart, gradient: 'from-brand-500 to-brand-600', permission: 'pos.use' },
  { href: '/vodafone-cash', label: 'فودافون كاش', icon: Smartphone, gradient: 'from-vodafone to-vodafone-light', permission: 'vodafone.view', badge: 'كاش' },
  { href: '/products', label: 'المنتجات', icon: Package, gradient: 'from-emerald2-500 to-emerald2-600', permission: 'products.view' },
  { href: '/inventory', label: 'المخازن', icon: Warehouse, gradient: 'from-royal to-royal-light', permission: 'inventory.view' },
  { href: '/suppliers', label: 'الموردين', icon: Truck, gradient: 'from-amber-500 to-orange-500', permission: 'suppliers.view' },
  { href: '/customers', label: 'العملاء', icon: Users, gradient: 'from-cyan-500 to-blue-500', permission: 'customers.view' },
  { href: '/offers', label: 'العروض', icon: Tag, gradient: 'from-pink-500 to-rose-500', permission: 'offers.manage', badge: '🔥' },
  { href: '/loyalty', label: 'نظام الولاء', icon: Gift, gradient: 'from-gold-400 to-gold-600', permission: 'loyalty.manage' },
  { href: '/orders', label: 'الطلبات', icon: ClipboardList, gradient: 'from-indigo-500 to-purple-500', permission: 'orders.view' },
  { href: '/reports', label: 'التقارير', icon: BarChart3, gradient: 'from-teal-500 to-cyan-500', permission: 'reports.view' },
  { href: '/employees', label: 'الموظفين', icon: UserCog, gradient: 'from-slate-500 to-gray-600', permission: 'employees.view' },
  { href: '/notifications', label: 'الإشعارات', icon: Bell, gradient: 'from-red-500 to-pink-500', permission: 'notifications.send' },
  { href: '/branches', label: 'الفروع', icon: Building2, gradient: 'from-lime-500 to-green-500' },
  { href: '/settings', label: 'الإعدادات', icon: Settings, gradient: 'from-zinc-500 to-slate-600', permission: 'settings.manage' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { hasPermission, user } = useAuthStore();

  const visibleItems = navItems.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <AnimatePresence initial={false}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 right-0 z-30 h-screen glass-strong border-l border-border/40 flex flex-col"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-border/30 h-20">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-luxury shadow-glow-orange"
          >
            <ShoppingCart className="h-6 w-6 text-white" />
          </motion.div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 overflow-hidden"
              >
                <h1 className="text-lg font-black text-gradient-luxury leading-tight">محمـد ماركت</h1>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-gold-400" />
                  النظام الاحترافي
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="absolute left-3 top-7 flex h-7 w-7 items-center justify-center rounded-lg glass hover:glass-strong transition-all"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
          {visibleItems.map((item, i) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link href={item.href} className="group relative block">
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 relative overflow-hidden',
                      active
                        ? 'nav-item-active'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeGlow"
                        className={cn('absolute inset-0 bg-gradient-to-l opacity-10', item.gradient)}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <div
                      className={cn(
                        'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
                        active
                          ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg`
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-gradient-to-br group-hover:' + item.gradient + ' group-hover:text-white'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex-1 whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {item.badge && !sidebarCollapsed && (
                      <span className={cn('text-[10px] font-bold rounded-full px-1.5 py-0.5', active ? 'bg-white/20 text-white' : 'bg-brand-500/15 text-brand-500')}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-border/30">
          <div className="flex items-center gap-3 rounded-xl glass p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-royal text-white text-sm font-bold">
              {user?.full_name?.[0] || 'م'}
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="text-xs font-bold truncate">{user?.full_name || 'مستخدم'}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{user?.role || 'admin'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
