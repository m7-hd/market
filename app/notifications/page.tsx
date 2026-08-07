'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellRing, Search, CheckCheck, Trash2, AlertTriangle,
  Package, Clock, Gift, Tag, ShoppingBag, Mail, MessageCircle,
  Smartphone, Send, Plus, X,
} from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { cn, formatDate, formatTime } from '@/lib/utils';
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
import type { AppNotification, NotificationType, NotificationChannel } from '@/types';

const typeConfig: Record<NotificationType, { label: string; icon: any; color: string }> = {
  low_stock: { label: 'نقص مخزون', icon: AlertTriangle, color: 'from-red-500 to-orange-600' },
  expiry_warning: { label: 'انتهاء صلاحية', icon: Clock, color: 'from-amber-500 to-yellow-600' },
  new_order: { label: 'طلب جديد', icon: ShoppingBag, color: 'from-blue-500 to-indigo-600' },
  offer: { label: 'عرض جديد', icon: Tag, color: 'from-emerald-500 to-green-600' },
  loyalty: { label: 'ولاء', icon: Gift, color: 'from-violet-500 to-purple-600' },
  system: { label: 'نظام', icon: Bell, color: 'from-slate-500 to-slate-700' },
};

const channelConfig: Record<NotificationChannel, { label: string; icon: any; color: string }> = {
  in_app: { label: 'داخلي', icon: Bell, color: 'text-blue-400' },
  sms: { label: 'SMS', icon: Smartphone, color: 'text-emerald-400' },
  whatsapp: { label: 'واتساب', icon: MessageCircle, color: 'text-green-400' },
  email: { label: 'بريد', icon: Mail, color: 'text-amber-400' },
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllRead, addNotification } = useDataStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all');
  const [sendOpen, setSendOpen] = useState(false);
  const [sendForm, setSendForm] = useState({
    title: '', message: '', channel: 'in_app' as NotificationChannel, recipient: '',
  });

  const filtered = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .filter((n) => {
        const matchSearch = n.title.includes(search) || n.message.includes(search);
        const matchFilter = filter === 'all' || (filter === 'unread' && !n.is_read) || n.type === filter;
        return matchSearch && matchFilter;
      });
  }, [notifications, search, filter]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const countByType = useMemo(() => {
    const map: Record<string, number> = {};
    notifications.forEach((n) => { map[n.type] = (map[n.type] || 0) + 1; });
    return map;
  }, [notifications]);

  const handleSend = () => {
    if (!sendForm.title || !sendForm.message) {
      toast.error('يرجى إدخال العنوان والرسالة');
      return;
    }
    addNotification({
      type: 'system',
      title: sendForm.title,
      message: sendForm.message,
      channel: sendForm.channel,
      recipient: sendForm.recipient || undefined,
      is_read: false,
    });
    toast.success('تم إرسال الإشعار بنجاح');
    setSendOpen(false);
    setSendForm({ title: '', message: '', channel: 'in_app', recipient: '' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BellRing}
        title="مركز الإشعارات"
        description="تنبيهات المخزون، الطلبات، العروض وإشعارات الولاء"
        gradient="from-amber-500 via-orange-500 to-red-600"
        action={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllRead}>
                <CheckCheck className="h-4 w-4 ml-2" />
                تعليم الكل كمقروء
              </Button>
            )}
            <Button variant="luxury" onClick={() => setSendOpen(true)}>
              <Send className="h-4 w-4 ml-2" />
              إرسال إشعار
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي الإشعارات" value={String(notifications.length)} icon={Bell} gradient="from-amber-500 to-orange-600" />
        <StatCard label="غير مقروءة" value={String(unreadCount)} icon={BellRing} gradient="from-red-500 to-pink-600" />
        <StatCard label="تنبيهات المخزون" value={String(countByType.low_stock || 0)} icon={AlertTriangle} gradient="from-orange-500 to-red-600" />
        <StatCard label="تنبيهات الصلاحية" value={String(countByType.expiry_warning || 0)} icon={Clock} gradient="from-yellow-500 to-amber-600" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث في الإشعارات..." className="pr-10" />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <Select.Trigger className="w-40"><Select.Value /></Select.Trigger>
          <Select.Content>
            <Select.Item value="all">الكل</Select.Item>
            <Select.Item value="unread">غير مقروءة</Select.Item>
            <Select.Item value="low_stock">نقص مخزون</Select.Item>
            <Select.Item value="expiry_warning">انتهاء صلاحية</Select.Item>
            <Select.Item value="new_order">طلبات جديدة</Select.Item>
            <Select.Item value="offer">عروض</Select.Item>
            <Select.Item value="loyalty">ولاء</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((n, i) => {
            const tc = typeConfig[n.type] || typeConfig.system;
            const cc = channelConfig[n.channel] || channelConfig.in_app;
            const Icon = tc.icon;
            const ChIcon = cc.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={cn('p-4 flex items-start gap-4 hover:bg-white/5 transition-all cursor-pointer group', !n.is_read && 'border-amber-500/30')}>
                  <div className={cn('flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br text-white shrink-0 shadow-lg', tc.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => !n.is_read && markNotificationRead(n.id)}>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold">{n.title}</h3>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                      <Badge variant="outline" className={cc.color}>
                        <ChIcon className="h-3 w-3 ml-1" />{cc.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    {n.recipient && <p className="text-xs text-muted-foreground mt-1">إلى: {n.recipient}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(n.created_at)} · {formatTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <Button size="iconSm" variant="ghost" onClick={() => markNotificationRead(n.id)} title="تعليم كمقروء">
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <EmptyState icon={Bell} title="لا توجد إشعارات" description="لم يتم العثور على إشعارات مطابقة" />
      )}

      {/* Send Notification Sheet */}
      <Sheet open={sendOpen} onOpenChange={setSendOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>إرسال إشعار جديد</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6 overflow-y-auto pb-20">
            <div className="space-y-2">
              <Label>العنوان *</Label>
              <Input value={sendForm.title} onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })} placeholder="عنوان الإشعار" />
            </div>
            <div className="space-y-2">
              <Label>الرسالة *</Label>
              <textarea
                value={sendForm.message}
                onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                placeholder="نص الرسالة..."
                rows={4}
                className="w-full rounded-xl glass border border-white/10 bg-transparent p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label>قناة الإرسال</Label>
              <Select value={sendForm.channel} onValueChange={(v) => setSendForm({ ...sendForm, channel: v as NotificationChannel })}>
                <Select.Trigger><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="in_app">داخل التطبيق</Select.Item>
                  <Select.Item value="sms">رسالة SMS</Select.Item>
                  <Select.Item value="whatsapp">واتساب</Select.Item>
                  <Select.Item value="email">بريد إلكتروني</Select.Item>
                </Select.Content>
              </Select>
            </div>
            {(sendForm.channel !== 'in_app') && (
              <div className="space-y-2">
                <Label>المستلم</Label>
                <Input value={sendForm.recipient} onChange={(e) => setSendForm({ ...sendForm, recipient: e.target.value })} placeholder={sendForm.channel === 'email' ? 'email@example.com' : '01xxxxxxxxx'} />
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button variant="luxury" className="flex-1" onClick={handleSend}>
                <Send className="h-4 w-4 ml-2" />إرسال
              </Button>
              <Button variant="outline" onClick={() => setSendOpen(false)}>
                <X className="h-4 w-4 ml-2" />إلغاء
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
