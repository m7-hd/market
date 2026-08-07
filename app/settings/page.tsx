'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Store, Palette, Globe, Shield, Database, Bell,
  Save, Moon, Sun, Languages, Lock, Download, Upload, RefreshCw,
  HardDrive, Printer, ScanLine, Scale, CheckCircle2, KeyRound,
  Building, Mail, Phone, MapPin,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { toast } from 'sonner';

type Tab = 'general' | 'appearance' | 'security' | 'backup' | 'hardware';

export default function SettingsPage() {
  const { theme, setTheme, lang, setLang } = useUIStore();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('general');
  const [store, setStore] = useState({
    name: 'محمد ماركت', nameEn: 'Mhmd Market', phone: '0223456789',
    email: 'info@mhmd-market.com', address: 'القاهرة - وسط البلد',
    currency: 'EGP', taxRate: 0, serviceFee: 0,
  });
  const [security, setSecurity] = useState({
    twoFactor: true, autoBackup: true, encryptData: true, safeDelete: true, auditLog: true,
    sessionTimeout: 30,
  });
  const [hardware, setHardware] = useState({
    barcodeScanner: true, thermalPrinter: true, scale: true,
    printerType: 'thermal_80mm', scannerType: 'usb',
  });

  const tabs = [
    { id: 'general' as const, label: 'عام', icon: Store },
    { id: 'appearance' as const, label: 'المظهر', icon: Palette },
    { id: 'security' as const, label: 'الأمان', icon: Shield },
    { id: 'backup' as const, label: 'النسخ الاحتياطي', icon: Database },
    { id: 'hardware' as const, label: 'الأجهزة', icon: HardDrive },
  ];

  const handleSave = (section: string) => {
    toast.success(`تم حفظ إعدادات ${section}`);
  };

  const handleBackup = () => {
    toast.success('تم إنشاء نسخة احتياطية بنجاح');
  };

  const handleRestore = () => {
    toast.success('تم استعادة النسخة الاحتياطية');
  };

  const handleExport = () => {
    toast.success('تم تصدير البيانات بصيغة Excel');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Settings}
        title="الإعدادات"
        description="إعدادات المتجر، المظهر، الأمان، النسخ الاحتياطي والأجهزة"
        gradient="from-slate-500 via-slate-600 to-zinc-700"
      />

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
                active ? 'bg-gradient-to-r from-slate-500 to-zinc-700 text-white shadow-lg' : 'glass hover:bg-white/10'
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* General */}
      {tab === 'general' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2"><Store className="h-5 w-5 text-emerald-400" />معلومات المتجر</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم المتجر (عربي)</Label>
                <Input value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>اسم المتجر (إنجليزي)</Label>
                <Input value={store.nameEn} onChange={(e) => setStore({ ...store, nameEn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label><Phone className="h-4 w-4 inline ml-1" />الهاتف</Label>
                <Input value={store.phone} onChange={(e) => setStore({ ...store, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label><Mail className="h-4 w-4 inline ml-1" />البريد الإلكتروني</Label>
                <Input value={store.email} onChange={(e) => setStore({ ...store, email: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label><MapPin className="h-4 w-4 inline ml-1" />العنوان</Label>
                <Input value={store.address} onChange={(e) => setStore({ ...store, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>العملة</Label>
                <Select value={store.currency} onValueChange={(v) => setStore({ ...store, currency: v })}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="EGP">جنيه مصري (EGP)</Select.Item>
                    <Select.Item value="SAR">ريال سعودي (SAR)</Select.Item>
                    <Select.Item value="USD">دولار أمريكي (USD)</Select.Item>
                    <Select.Item value="AED">درهم إماراتي (AED)</Select.Item>
                  </Select.Content>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>نسبة الضريبة (%)</Label>
                <Input type="number" value={store.taxRate} onChange={(e) => setStore({ ...store, taxRate: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>رسوم الخدمة (%)</Label>
                <Input type="number" value={store.serviceFee} onChange={(e) => setStore({ ...store, serviceFee: Number(e.target.value) })} />
              </div>
            </div>
            <Button variant="luxury" onClick={() => handleSave('المتجر')}>
              <Save className="h-4 w-4 ml-2" />حفظ الإعدادات
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Appearance */}
      {tab === 'appearance' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Palette className="h-5 w-5 text-violet-400" />المظهر والثيم</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setTheme('dark'); toast.success('تم تفعيل الوضع الداكن'); }}
                className={cn(
                  'glass rounded-2xl p-6 border-2 transition-all text-center',
                  theme === 'dark' ? 'border-violet-500 scale-105' : 'border-transparent hover:scale-105'
                )}
              >
                <Moon className="h-12 w-12 mx-auto text-violet-400 mb-3" />
                <p className="font-bold">الوضع الداكن</p>
                <p className="text-sm text-muted-foreground">مريح للعين ليلاً</p>
                {theme === 'dark' && <Badge variant="premium" className="mt-2"><CheckCircle2 className="h-3 w-3 ml-1" />مفعّل</Badge>}
              </button>
              <button
                onClick={() => { setTheme('light'); toast.success('تم تفعيل الوضع الفاتح'); }}
                className={cn(
                  'glass rounded-2xl p-6 border-2 transition-all text-center',
                  theme === 'light' ? 'border-amber-500 scale-105' : 'border-transparent hover:scale-105'
                )}
              >
                <Sun className="h-12 w-12 mx-auto text-amber-400 mb-3" />
                <p className="font-bold">الوضع الفاتح</p>
                <p className="text-sm text-muted-foreground">أنيق وواضح</p>
                {theme === 'light' && <Badge variant="gold" className="mt-2"><CheckCircle2 className="h-3 w-3 ml-1" />مفعّل</Badge>}
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Languages className="h-5 w-5 text-blue-400" />اللغة</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setLang('ar'); toast.success('تم تغيير اللغة إلى العربية'); }}
                className={cn(
                  'glass rounded-2xl p-6 border-2 transition-all text-center',
                  lang === 'ar' ? 'border-emerald-500 scale-105' : 'border-transparent hover:scale-105'
                )}
              >
                <Globe className="h-12 w-12 mx-auto text-emerald-400 mb-3" />
                <p className="font-bold">العربية</p>
                <p className="text-sm text-muted-foreground">RTL - من اليمين لليسار</p>
              </button>
              <button
                onClick={() => { setLang('en'); toast.success('Language changed to English'); }}
                className={cn(
                  'glass rounded-2xl p-6 border-2 transition-all text-center',
                  lang === 'en' ? 'border-blue-500 scale-105' : 'border-transparent hover:scale-105'
                )}
              >
                <Globe className="h-12 w-12 mx-auto text-blue-400 mb-3" />
                <p className="font-bold">English</p>
                <p className="text-sm text-muted-foreground">LTR - Left to Right</p>
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-red-400" />إعدادات الأمان</h3>

            <ToggleRow
              icon={KeyRound} title="المصادقة الثنائية (2FA)"
              description="طلب رمز تحقق إضافي عند تسجيل الدخول"
              checked={security.twoFactor}
              onChange={(v) => setSecurity({ ...security, twoFactor: v })}
            />
            <ToggleRow
              icon={RefreshCw} title="النسخ الاحتياطي التلقائي"
              description="نسخ احتياطي يومي للبيانات"
              checked={security.autoBackup}
              onChange={(v) => setSecurity({ ...security, autoBackup: v })}
            />
            <ToggleRow
              icon={Lock} title="تشفير البيانات"
              description="تشفير جميع البيانات الحساسة"
              checked={security.encryptData}
              onChange={(v) => setSecurity({ ...security, encryptData: v })}
            />
            <ToggleRow
              icon={Shield} title="الحذف الآمن"
              description="عدم حذف البيانات نهائياً بل أرشفتها"
              checked={security.safeDelete}
              onChange={(v) => setSecurity({ ...security, safeDelete: v })}
            />
            <ToggleRow
              icon={Database} title="سجل التدقيق"
              description="تسجيل كل العمليات في النظام"
              checked={security.auditLog}
              onChange={(v) => setSecurity({ ...security, auditLog: v })}
            />

            <div className="space-y-2 pt-2">
              <Label>مدة انتهاء الجلسة (دقيقة)</Label>
              <Input type="number" value={security.sessionTimeout} onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })} className="max-w-xs" />
            </div>

            <Button variant="luxury" onClick={() => handleSave('الأمان')}>
              <Save className="h-4 w-4 ml-2" />حفظ إعدادات الأمان
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Backup */}
      {tab === 'backup' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Database className="h-5 w-5 text-blue-400" />النسخ الاحتياطي والاستعادة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-6 text-center">
                <Download className="h-12 w-12 mx-auto text-emerald-400 mb-3" />
                <h4 className="font-bold mb-2">إنشاء نسخة احتياطية</h4>
                <p className="text-sm text-muted-foreground mb-4">حفظ نسخة كاملة من جميع البيانات</p>
                <Button variant="emerald" className="w-full" onClick={handleBackup}>
                  <Download className="h-4 w-4 ml-2" />نسخ احتياطي الآن
                </Button>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-blue-400 mb-3" />
                <h4 className="font-bold mb-2">استعادة نسخة احتياطية</h4>
                <p className="text-sm text-muted-foreground mb-4">استعادة البيانات من نسخة سابقة</p>
                <Button variant="outline" className="w-full" onClick={handleRestore}>
                  <Upload className="h-4 w-4 ml-2" />استعادة
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Download className="h-5 w-5 text-amber-400" />تصدير البيانات</h3>
            <p className="text-sm text-muted-foreground mb-4">تصدير جميع البيانات بصيغة Excel للمراجعة أو النقل</p>
            <Button variant="gold" onClick={handleExport}>
              <Download className="h-4 w-4 ml-2" />تصدير Excel
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">آخر النسخ الاحتياطية</h3>
            <div className="space-y-2">
              {[
                { date: 'اليوم - 03:00 ص', size: '2.4 MB', type: 'تلقائي' },
                { date: 'أمس - 03:00 ص', size: '2.3 MB', type: 'تلقائي' },
                { date: 'قبل 3 أيام - 10:30 ص', size: '2.1 MB', type: 'يدوي' },
              ].map((b, i) => (
                <div key={i} className="flex items-center justify-between glass rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium">{b.date}</p>
                      <p className="text-xs text-muted-foreground">{b.size}</p>
                    </div>
                  </div>
                  <Badge variant={b.type === 'تلقائي' ? 'success' : 'outline'}>{b.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Hardware */}
      {tab === 'hardware' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2"><HardDrive className="h-5 w-5 text-cyan-400" />إعدادات الأجهزة الطرفية</h3>

            <ToggleRow
              icon={ScanLine} title="ماسح الباركود"
              description="تفعيل دعم ماسح الباركود USB/Bluetooth"
              checked={hardware.barcodeScanner}
              onChange={(v) => setHardware({ ...hardware, barcodeScanner: v })}
            />
            <ToggleRow
              icon={Printer} title="طابعة الحرارية"
              description="دعم طابعة الإيصالات الحرارية"
              checked={hardware.thermalPrinter}
              onChange={(v) => setHardware({ ...hardware, thermalPrinter: v })}
            />
            <ToggleRow
              icon={Scale} title="الميزان الإلكتروني"
              description="ربط الميزان الإلكتروني للمنتجات بالوزن"
              checked={hardware.scale}
              onChange={(v) => setHardware({ ...hardware, scale: v })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>نوع الطابعة</Label>
                <Select value={hardware.printerType} onValueChange={(v) => setHardware({ ...hardware, printerType: v })}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="thermal_80mm">حرارية 80mm</Select.Item>
                    <Select.Item value="thermal_58mm">حرارية 58mm</Select.Item>
                    <Select.Item value="a4">ورق A4</Select.Item>
                  </Select.Content>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>نوع الماسح</Label>
                <Select value={hardware.scannerType} onValueChange={(v) => setHardware({ ...hardware, scannerType: v })}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="usb">USB</Select.Item>
                    <Select.Item value="bluetooth">Bluetooth</Select.Item>
                    <Select.Item value="camera">كاميرا الجهاز</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </div>

            <Button variant="luxury" onClick={() => handleSave('الأجهزة')}>
              <Save className="h-4 w-4 ml-2" />حفظ إعدادات الأجهزة
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function ToggleRow({ icon: Icon, title, description, checked, onChange }: {
  icon: any; title: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between glass rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={cn('flex items-center justify-center w-10 h-10 rounded-xl', checked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400')}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0',
          checked ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-slate-700'
        )}
      >
        <motion.div
          layout
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ left: checked ? '26px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
