'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ShoppingCart, Phone, Lock, Eye, EyeOff, ArrowLeft, Sparkles,
  ShieldCheck, Fingerprint, Loader2, Moon, Sun, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { changeLanguage } from '@/lib/i18n';
import type { UserProfile } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { theme, toggleTheme, lang, toggleLang } = useUIStore();
  const [phone, setPhone] = React.useState('01000000000');
  const [password, setPassword] = React.useState('admin123');
  const [showPass, setShowPass] = React.useState(false);
  const [step, setStep] = React.useState<'login' | '2fa'>('login');
  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const [loading, setLoading] = React.useState(false);
  const [showPin, setShowPin] = React.useState(false);

  const codeRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    // Demo login — admin
    const user: UserProfile = {
      id: 'demo-admin',
      full_name: 'محمد Administrator',
      phone,
      email: 'admin@mhmdmarket.com',
      role: 'admin',
      two_factor_enabled: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLoading(false);
    setStep('2fa');
    toast.success('تم إرسال رمز التحقق', { description: 'أدخل الرمز المرسل إلى هاتفك' });
  };

  const handleCodeChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
  };

  const handleCodeKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    if (code.join('').length < 6) {
      toast.error('أدخل الرمز كاملاً');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const user: UserProfile = {
      id: 'demo-admin',
      full_name: 'محمد Administrator',
      phone,
      email: 'admin@mhmdmarket.com',
      role: 'admin',
      two_factor_enabled: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    login(user);
    setLoading(false);
    toast.success('مرحباً بك في محمـد ماركت 🎉');
    router.push('/dashboard');
  };

  const quickLogin = (role: 'admin' | 'cashier' | 'manager') => {
    const users: Record<string, UserProfile> = {
      admin: { id: 'demo-admin', full_name: 'محمد - مدير النظام', phone: '01000000000', role: 'admin', two_factor_enabled: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      manager: { id: 'demo-mgr', full_name: 'أحمد - مدير', phone: '01011111111', role: 'manager', two_factor_enabled: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      cashier: { id: 'demo-cash', full_name: 'سارة - كاشير', phone: '01022222222', role: 'cashier', two_factor_enabled: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    };
    login(users[role]);
    toast.success(`مرحباً ${users[role].full_name}`);
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Top controls */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-20">
        <Button variant="glass" size="iconSm" onClick={toggleTheme} title="الوضع الليلي">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="glass"
          size="iconSm"
          onClick={() => { toggleLang(); changeLanguage(lang === 'ar' ? 'en' : 'ar'); }}
          title="Language"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <span className="badge-premium">
          <Sparkles className="h-3.5 w-3.5" />
          نظام احترافي · الإصدار 1.0
        </span>
      </div>

      {/* Floating decorative icons */}
      <FloatingIcons />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glow border wrapper */}
        <div className="glow-border rounded-2xl">
          <div className="glass-strong rounded-2xl p-8 shadow-luxury">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-luxury shadow-glow-orange"
            >
              <ShoppingCart className="h-10 w-10 text-white" />
            </motion.div>

            <AnimatePresence mode="wait">
              {step === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-gradient-luxury mb-2">محمـد ماركت</h1>
                    <p className="text-sm text-muted-foreground">نظام إدارة السوبر ماركت الاحترافي</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pr-10"
                          placeholder="01XXXXXXXXX"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pass">كلمة المرور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="pass"
                          type={showPass ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10 pl-10"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" variant="luxury" size="lg" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                      {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                    </Button>
                  </form>

                  {/* Quick demo logins */}
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <p className="text-xs text-center text-muted-foreground mb-3">دخول سريع للتجربة</p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" onClick={() => quickLogin('admin')}>مدير</Button>
                      <Button variant="outline" size="sm" onClick={() => quickLogin('manager')}>مدير فرع</Button>
                      <Button variant="outline" size="sm" onClick={() => quickLogin('cashier')}>كاشير</Button>
                    </div>
                  </div>

                  {/* 2FA badge */}
                  <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald2-500" />
                    محمي بالتحقق بخطوتين (2FA)
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="2fa"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-royal shadow-glow-royal"
                    >
                      <Fingerprint className="h-8 w-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-black text-gradient-royal mb-2">التحقق بخطوتين</h2>
                    <p className="text-sm text-muted-foreground">أدخل الرمز المرسل إلى هاتفك</p>
                  </div>

                  <div className="flex justify-center gap-2 mb-6" dir="ltr">
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { codeRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKey(i, e)}
                        className="h-14 w-12 rounded-xl border-2 border-border bg-background/50 text-center text-2xl font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-all"
                      />
                    ))}
                  </div>

                  <Button variant="luxury" size="lg" className="w-full mb-3" onClick={handleVerify} disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    تأكيد الرمز
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setStep('login')}>
                    <ArrowLeft className="h-4 w-4" />
                    رجوع
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 محمـد ماركت · جميع الحقوق محفوظة
        </p>
      </motion.div>
    </div>
  );
}

function FloatingIcons() {
  const icons = [
    { Icon: ShoppingCart, x: '10%', y: '20%', delay: 0, duration: 7 },
    { Icon: Phone, x: '85%', y: '25%', delay: 1, duration: 8 },
    { Icon: Sparkles, x: '15%', y: '70%', delay: 2, duration: 6 },
    { Icon: ShieldCheck, x: '88%', y: '75%', delay: 0.5, duration: 9 },
  ];
  return (
    <>
      {icons.map(({ Icon, x, y, delay, duration }, i) => (
        <motion.div
          key={i}
          className="absolute text-brand-500/15 dark:text-brand-400/10"
          style={{ left: x, top: y }}
          animate={{ y: [0, -25, 0], rotate: [0, 10, 0] }}
          transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="h-16 w-16" />
        </motion.div>
      ))}
    </>
  );
}
