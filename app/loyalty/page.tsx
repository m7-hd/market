'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gift, Star, Crown, Cake, Save, Sparkles, TrendingUp,
  Award, Zap, Heart, Trophy,
} from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { cn, formatNumber, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { toast } from 'sonner';
import type { LoyaltyTier } from '@/types';

const tierIcons: Record<LoyaltyTier, any> = { bronze: Award, silver: Star, gold: Crown, platinum: Sparkles, vip: Trophy };
const tierLabels: Record<LoyaltyTier, string> = { bronze: 'برونزي', silver: 'فضي', gold: 'ذهبي', platinum: 'بلاتيني', vip: 'VIP' };

export default function LoyaltyPage() {
  const { loyaltyRule, tierRules, customers, updateLoyaltyRule } = useDataStore();
  const [rule, setRule] = useState(loyaltyRule);

  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const vipCustomers = customers.filter((c) => c.loyalty_tier === 'vip').length;
  const goldCustomers = customers.filter((c) => c.loyalty_tier === 'gold').length;
  const birthdaysThisMonth = customers.filter((c) => {
    if (!c.birthday) return false;
    const m = new Date(c.birthday).getMonth();
    return m === new Date().getMonth();
  }).length;

  const saveRule = () => { updateLoyaltyRule(rule); toast.success('تم تحديث قواعد الولاء'); };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Gift}
        title="نظام الولاء والنقاط"
        description="المستويات، القواعد، النقاط، الكوبونات، هدايا المواليد والإنجازات"
        gradient="from-gold-400 to-gold-600"
        action={<Button variant="gold" size="lg" onClick={saveRule}><Save className="h-5 w-5" /> حفظ القواعد</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي النقاط" value={formatNumber(totalPoints)} icon={Star} gradient="from-gold-400 to-gold-600" />
        <StatCard label="عملاء VIP" value={vipCustomers} icon={Trophy} gradient="from-purple-500 to-fuchsia-600" />
        <StatCard label="عملاء ذهبيين" value={goldCustomers} icon={Crown} gradient="from-gold-400 to-yellow-600" />
        <StatCard label="مواليد هذا الشهر" value={birthdaysThisMonth} icon={Cake} gradient="from-pink-500 to-rose-500" />
      </div>

      {/* Tier Ladder */}
      <div>
        <h2 className="text-lg font-black mb-3 flex items-center gap-2"><Trophy className="h-5 w-5 text-gold-400" /> سلم المستويات</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {tierRules.map((t, i) => {
            const Icon = tierIcons[t.tier];
            const count = customers.filter((c) => c.loyalty_tier === t.tier).length;
            return (
              <motion.div key={t.tier} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="p-4 text-center relative overflow-hidden" style={{ borderTop: `3px solid ${t.color}` }}>
                  <div className="absolute top-0 right-0 h-20 w-20 rounded-full blur-2xl opacity-20" style={{ background: t.color }} />
                  <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-black text-sm" style={{ color: t.color }}>{tierLabels[t.tier]}</h3>
                  <p className="text-[10px] text-muted-foreground mb-2">من {formatNumber(t.min_points)} نقطة</p>
                  <Badge variant="outline" className="text-[9px] mb-2">مضاعف ×{t.multiplier}</Badge>
                  <p className="text-[10px] font-bold text-emerald-400 mb-2">{count} عميل</p>
                  <div className="text-right space-y-1">
                    {t.benefits.map((b, j) => (
                      <p key={j} className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Heart className="h-2.5 w-2.5 text-pink-400" /> {b}
                      </p>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Rules */}
      <div>
        <h2 className="text-lg font-black mb-3 flex items-center gap-2"><Zap className="h-5 w-5 text-gold-400" /> قواعد النظام</h2>
        <Card className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="flex items-center gap-1"><TrendingUp className="h-4 w-4 text-emerald-400" /> نقطة لكل جنيه</Label>
              <Input type="number" step="0.1" value={rule.points_per_egyptian_pound} onChange={(e) => setRule({ ...rule, points_per_egyptian_pound: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Cake className="h-4 w-4 text-pink-400" /> نقاط هدية الميلاد</Label>
              <Input type="number" value={rule.birthday_gift_points} onChange={(e) => setRule({ ...rule, birthday_gift_points: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Award className="h-4 w-4 text-gold-400" /> نقاط الإنجاز</Label>
              <Input type="number" value={rule.milestone_gift_points} onChange={(e) => setRule({ ...rule, milestone_gift_points: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Trophy className="h-4 w-4 text-purple-400" /> عدد طلبات الإنجاز</Label>
              <Input type="number" value={rule.order_milestone} onChange={(e) => setRule({ ...rule, order_milestone: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Sparkles className="h-4 w-4 text-royal" /> مضاعف المناسبات</Label>
              <Input type="number" step="0.1" value={rule.event_multiplier} onChange={(e) => setRule({ ...rule, event_multiplier: parseFloat(e.target.value) || 1 })} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer w-full">
                <input type="checkbox" checked={rule.is_event_active} onChange={(e) => setRule({ ...rule, is_event_active: e.target.checked })} className="accent-gold-500 h-5 w-5" />
                <span className="font-semibold">تفعيل مضاعف المناسبات</span>
              </label>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Customers */}
      <div>
        <h2 className="text-lg font-black mb-3 flex items-center gap-2"><Crown className="h-5 w-5 text-gold-400" /> أفضل العملاء بالنقاط</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...customers].sort((a, b) => b.points - a.points).slice(0, 6).map((c, i) => {
            const Icon = tierIcons[c.loyalty_tier];
            return (
              <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-white font-black text-lg shadow-lg">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{c.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Icon className="h-3 w-3" style={{ color: tierRules.find((t) => t.tier === c.loyalty_tier)?.color }} />
                      <span className="text-[10px] text-muted-foreground">{tierLabels[c.loyalty_tier]}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-black text-gold-400">{formatNumber(c.points)}</p>
                    <p className="text-[10px] text-muted-foreground">نقطة</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
