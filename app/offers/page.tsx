'use client';

import { useState, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Edit2, Trash2, Flame, Percent, Gift, Calendar,
  Clock, ShoppingCart, Save, X, ToggleLeft, ToggleRight, Sparkles,
} from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { cn, formatDate, uid } from '@/lib/utils';
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
import type { Offer, OfferType, Coupon } from '@/types';

const offerTypeConfig: Record<OfferType, { label: string; icon: ComponentType<{ className?: string }>; color: string }> = {
  bogo: { label: 'اشتري واحصل', icon: Gift, color: 'from-pink-500 to-rose-500' },
  quantity_discount: { label: 'خصم كمية', icon: ShoppingCart, color: 'from-purple-500 to-indigo-500' },
  category_discount: { label: 'خصم فئة', icon: Tag, color: 'from-blue-500 to-cyan-500' },
  weekend: { label: 'عرض الجمعة', icon: Calendar, color: 'from-emerald-500 to-green-600' },
  ramadan: { label: 'رمضان', icon: Flame, color: 'from-amber-600 to-orange-700' },
  eid: { label: 'العيد', icon: Sparkles, color: 'from-gold-400 to-gold-600' },
  happy_hour: { label: 'ساعة سعيدة', icon: Clock, color: 'from-vodafone to-red-700' },
  auto: { label: 'تلقائي', icon: Percent, color: 'from-slate-500 to-gray-600' },
};

export default function OffersPage() {
  const { offers, addOffer, updateOffer, toggleOffer, deleteOffer, coupons, addCoupon, deleteCoupon } = useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [showCoupon, setShowCoupon] = useState(false);

  const activeOffers = offers.filter((o) => o.is_active).length;

  const handleSave = (data: Partial<Offer> & { name: string; type: Offer['type']; start_date: string; end_date: string; is_active: boolean; is_auto: boolean; product_ids: string[]; category_ids: string[] }) => {
    if (editOffer) { updateOffer(editOffer.id, data); toast.success('تم تحديث العرض'); }
    else { addOffer({ ...data } as Omit<Offer, 'id' | 'created_at'>); toast.success('تم إضافة العرض'); }
    setShowForm(false); setEditOffer(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Tag}
        title="إدارة العروض والكوبونات"
        description="عروض اشترِ واحصل، خصم كمية، خصم فئة، عروض موسمية وكوبونات"
        gradient="from-pink-500 to-rose-500"
        badge="🔥"
        action={
          <div className="flex gap-2">
            <Button variant="glass" onClick={() => setShowCoupon(true)}><Gift className="h-4 w-4" /> كوبون</Button>
            <Button variant="vodafone" onClick={() => { setEditOffer(null); setShowForm(true); }}><Plus className="h-5 w-5" /> عرض جديد</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي العروض" value={offers.length} icon={Tag} gradient="from-pink-500 to-rose-500" />
        <StatCard label="عروض نشطة" value={activeOffers} icon={Flame} gradient="from-orange-500 to-red-600" />
        <StatCard label="الكوبونات" value={coupons.length} icon={Gift} gradient="from-purple-500 to-indigo-600" />
        <StatCard label="عروض موسمية" value={offers.filter((o) => ['ramdan', 'eid', 'weekend', 'happy_hour'].includes(o.type)).length} icon={Calendar} gradient="from-emerald-500 to-green-600" />
      </div>

      {/* Offers */}
      <div>
        <h2 className="text-lg font-black mb-3 flex items-center gap-2"><Flame className="h-5 w-5 text-pink-500" /> العروض الحالية</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {offers.map((o, i) => {
              const config = offerTypeConfig[o.type];
              const Icon = config.icon;
              return (
                <motion.div key={o.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.04 }}>
                  <Card className={cn('p-4 relative overflow-hidden transition-all', o.is_active ? 'hover:shadow-glow-orange' : 'opacity-60')}>
                    <div className={cn('absolute top-0 right-0 h-24 w-24 rounded-full blur-2xl opacity-20 bg-gradient-to-br', config.color)} />
                    <div className="flex items-start justify-between mb-3 relative">
                      <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', config.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleOffer(o.id)}>
                          {o.is_active ? <ToggleRight className="h-7 w-7 text-emerald-400" /> : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-sm mb-1">{o.name}</h3>
                    {o.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{o.description}</p>}
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge className={cn('text-[9px] bg-gradient-to-r text-white border-0', config.color)}>{config.label}</Badge>
                      {o.discount_percentage && <Badge variant="gold" className="text-[9px]">خصم {o.discount_percentage}%</Badge>}
                      {o.buy_qty && o.get_qty && <Badge variant="outline" className="text-[9px]">اشترِ {o.buy_qty} احصل {o.get_qty}</Badge>}
                      {o.is_auto && <Badge variant="success" className="text-[9px]">تلقائي</Badge>}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(o.start_date)}</span>
                      <span>←</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(o.end_date)}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="glass" className="flex-1" onClick={() => { setEditOffer(o); setShowForm(true); }}><Edit2 className="h-3 w-3" /> تعديل</Button>
                      <Button size="iconSm" variant="ghost" onClick={() => { if (confirm('حذف هذا العرض؟')) { deleteOffer(o.id); toast.success('تم حذف العرض'); } }}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Coupons */}
      <div>
        <h2 className="text-lg font-black mb-3 flex items-center gap-2"><Gift className="h-5 w-5 text-purple-400" /> الكوبونات</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coupons.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-4">
                  <p className="text-2xl font-black text-gradient-royal mb-1">{c.code}</p>
                  <Badge variant="royal" className="text-[9px] mb-2">{c.type === 'percentage' ? `خصم ${c.value}%` : c.type === 'fixed' ? `خصم ${c.value} ج.م` : 'منتج مجاني'}</Badge>
                  {c.min_order && <p className="text-[10px] text-muted-foreground">حد أدنى: {c.min_order} ج.م</p>}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
                    <span>استخدام: {c.used_count}/{c.usage_limit || '∞'}</span>
                    {c.expires_at && <span>ينتهي: {formatDate(c.expires_at)}</span>}
                  </div>
                  <Button size="sm" variant="ghost" className="w-full mt-2 text-red-400" onClick={() => { if (confirm('حذف هذا الكوبون؟')) { deleteCoupon(c.id); toast.success('تم حذف الكوبون'); } }}><Trash2 className="h-3 w-3" /> حذف</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Offer Form */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="left" className="w-[480px] overflow-y-auto">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-pink-500" /> {editOffer ? 'تعديل عرض' : 'عرض جديد'}</SheetTitle></SheetHeader>
          <OfferForm offer={editOffer} onSave={handleSave} onCancel={() => setShowForm(false)} />
        </SheetContent>
      </Sheet>

      {/* Coupon Form */}
      <Sheet open={showCoupon} onOpenChange={setShowCoupon}>
        <SheetContent side="left" className="w-[440px]">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-purple-400" /> كوبون جديد</SheetTitle></SheetHeader>
          <CouponForm onSave={(data) => { addCoupon({ ...data, used_count: 0, is_active: true } as Omit<Coupon, 'id' | 'created_at'>); setShowCoupon(false); toast.success('تم إضافة الكوبون'); }} onCancel={() => setShowCoupon(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function OfferForm({ offer, onSave, onCancel }: {
  offer?: Offer | null;
  onSave: (data: Partial<Offer> & { name: string; type: Offer['type']; start_date: string; end_date: string; is_active: boolean; is_auto: boolean; product_ids: string[]; category_ids: string[] }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<{
    name: string; type: OfferType; description: string;
    discount_percentage: number; buy_qty: number; get_qty: number;
    start_date: string; end_date: string; is_active: boolean; is_auto: boolean;
  }>({
    name: offer?.name || '', type: offer?.type || 'bogo', description: offer?.description || '',
    discount_percentage: offer?.discount_percentage || 0, buy_qty: offer?.buy_qty || 1, get_qty: offer?.get_qty || 1,
    start_date: offer?.start_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    end_date: offer?.end_date?.split('T')[0] || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    is_active: offer?.is_active ?? true, is_auto: offer?.is_auto ?? false,
  });
  const types = Object.entries(offerTypeConfig).map(([value, { label }]) => ({ value, label }));
  return (
    <div className="mt-4 space-y-4">
      <div><Label>اسم العرض</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div>
        <Label>نوع العرض</Label>
        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as OfferType })}>
          <Select.Trigger><Select.Value /></Select.Trigger>
          <Select.Content>{types.map((t) => <Select.Item key={t.value} value={t.value}>{t.label}</Select.Item>)}</Select.Content>
        </Select>
      </div>
      <div><Label>الوصف</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      {(form.type === 'bogo' || form.type === 'quantity_discount' || form.type === 'ramadan') && (
        <div className="grid grid-cols-2 gap-3">
          <div><Label>اشترِ</Label><Input type="number" value={form.buy_qty} onChange={(e) => setForm({ ...form, buy_qty: parseInt(e.target.value) || 1 })} /></div>
          <div><Label>احصل على</Label><Input type="number" value={form.get_qty} onChange={(e) => setForm({ ...form, get_qty: parseInt(e.target.value) || 1 })} /></div>
        </div>
      )}
      {(form.type === 'category_discount' || form.type === 'weekend' || form.type === 'happy_hour' || form.type === 'eid') && (
        <div><Label>نسبة الخصم %</Label><Input type="number" value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: parseFloat(e.target.value) || 0 })} /></div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div><Label>تاريخ البداية</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
        <div><Label>تاريخ النهاية</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-pink-500 h-4 w-4" /> نشط</label>
        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_auto} onChange={(e) => setForm({ ...form, is_auto: e.target.checked })} className="accent-pink-500 h-4 w-4" /> تلقائي</label>
      </div>
      <div className="flex gap-2 pt-4">
        <Button variant="glass" className="flex-1" onClick={onCancel}>إلغاء</Button>
        <Button variant="vodafone" className="flex-1" onClick={() => { if (!form.name) { toast.error('يرجى إدخال الاسم'); return; } onSave({ ...form, start_date: new Date(form.start_date).toISOString(), end_date: new Date(form.end_date).toISOString(), product_ids: [], category_ids: [] }); }}><Save className="h-5 w-5" /> حفظ</Button>
      </div>
    </div>
  );
}

function CouponForm({ onSave, onCancel }: {
  onSave: (data: Partial<Coupon>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<{ code: string; type: Coupon['type']; value: number; min_order: number; usage_limit: number }>({ code: '', type: 'percentage', value: 10, min_order: 0, usage_limit: 100 });
  return (
    <div className="mt-4 space-y-4">
      <div><Label>كود الكوبون</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" className="font-mono" /></div>
      <div>
        <Label>النوع</Label>
        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Coupon['type'] })}>
          <Select.Trigger><Select.Value /></Select.Trigger>
          <Select.Content>
            <Select.Item value="percentage">نسبة مئوية</Select.Item>
            <Select.Item value="fixed">مبلغ ثابت</Select.Item>
            <Select.Item value="free_item">منتج مجاني</Select.Item>
          </Select.Content>
        </Select>
      </div>
      {form.type !== 'free_item' && <div><Label>القيمة</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} /></div>}
      <div className="grid grid-cols-2 gap-3">
        <div><Label>حد أدنى للطلب</Label><Input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: parseFloat(e.target.value) || 0 })} /></div>
        <div><Label>حد الاستخدام</Label><Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: parseInt(e.target.value) || 0 })} /></div>
      </div>
      <div className="flex gap-2 pt-4">
        <Button variant="glass" className="flex-1" onClick={onCancel}>إلغاء</Button>
        <Button variant="royal" className="flex-1" onClick={() => { if (!form.code) { toast.error('يرجى إدخال الكود'); return; } onSave({ ...form, used_count: 0, is_active: true }); }}><Save className="h-5 w-5" /> حفظ</Button>
      </div>
    </div>
  );
}
