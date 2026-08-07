'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search, Bell, Moon, Sun, Globe, LogOut, ChevronDown,
  ShoppingCart, Smartphone, AlertTriangle, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { changeLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Topbar({ title }: { title: string }) {
  const router = useRouter();
  const { theme, toggleTheme, lang, toggleLang } = useUIStore();
  const { user, logout } = useAuthStore();
  const [showNotif, setShowNotif] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const notifications = [
    { id: 1, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/15', title: 'نفاد مخزون', msg: 'منتج "أرز مصري" وصل للحد الأدنى', time: 'من 5 دقائق' },
    { id: 2, icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/15', title: 'انتهاء صلاحية', msg: '3 منتجات تنتهي خلال أسبوع', time: 'من 12 دقيقة' },
    { id: 3, icon: ShoppingCart, color: 'text-emerald2-500', bg: 'bg-emerald2-500/15', title: 'طلب جديد', msg: 'طلب واتساب جديد من عميل', time: 'من 25 دقيقة' },
    { id: 4, icon: Smartphone, color: 'text-vodafone', bg: 'bg-vodafone/15', title: 'فودافون كاش', msg: 'إيداع 500 جنيه ناجح', time: 'من ساعة' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-20 glass-strong border-b border-border/30">
      <div className="flex items-center justify-between gap-4 px-6 h-20">
        {/* Title */}
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-xl font-black text-gradient-luxury">{title}</h1>
            <p className="text-xs text-muted-foreground">
              {time.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })} · {time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </motion.div>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث سريع... (منتج، عميل، فاتورة)" className="pr-10 glass" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button variant="glass" size="iconSm" onClick={toggleTheme} title="الوضع الليلي">
            <AnimatePresence mode="wait">
              <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.div>
            </AnimatePresence>
          </Button>

          {/* Lang */}
          <Button
            variant="glass"
            size="iconSm"
            onClick={() => { toggleLang(); changeLanguage(lang === 'ar' ? 'en' : 'ar'); }}
            title="Language"
          >
            <Globe className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button variant="glass" size="iconSm" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }} className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-vodafone text-[9px] font-bold text-white animate-pulse">
                {notifications.length}
              </span>
            </Button>
            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-2 w-80 glass-strong rounded-2xl shadow-luxury p-2 z-50"
                >
                  <div className="flex items-center justify-between px-3 py-2 mb-1">
                    <h3 className="font-bold text-sm">الإشعارات</h3>
                    <span className="badge-premium text-[10px]">{notifications.length} جديد</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto no-scrollbar space-y-1">
                    {notifications.map((n) => {
                      const Icon = n.icon;
                      return (
                        <div key={n.id} className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-muted/50 cursor-pointer transition-colors">
                          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', n.bg)}>
                            <Icon className={cn('h-4 w-4', n.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{n.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{n.msg}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              className="flex items-center gap-2 rounded-xl glass px-3 py-1.5 hover:glass-strong transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-royal text-white text-xs font-bold">
                {user?.full_name?.[0] || 'م'}
              </div>
              <span className="hidden sm:inline text-sm font-semibold">{user?.full_name?.split(' ')[0] || 'محمد'}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-2 w-56 glass-strong rounded-2xl shadow-luxury p-2 z-50"
                >
                  <div className="px-3 py-2 border-b border-border/30 mb-1">
                    <p className="font-bold text-sm">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                  <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors">
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
