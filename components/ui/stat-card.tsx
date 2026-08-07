'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type IconType = React.ComponentType<{ className?: string }>;

interface StatCardProps {
  title?: string;
  label?: string;
  value: string | number;
  icon: IconType | React.ReactNode;
  trend?: number | string; // percentage or text label
  trendLabel?: string;
  gradient?: 'orange' | 'gold' | 'emerald' | 'vodafone' | 'royal' | string;
  delay?: number;
  suffix?: string;
  isCurrency?: boolean;
}

const gradientMap: Record<string, { from: string; to: string; glow: string; text: string }> = {
  orange: { from: 'from-brand-500', to: 'to-brand-600', glow: '#f97316', text: 'text-gradient-luxury' },
  gold: { from: 'from-gold-400', to: 'to-gold-600', glow: '#fbbf24', text: 'text-gradient-gold' },
  emerald: { from: 'from-emerald2-500', to: 'to-emerald2-600', glow: '#10b981', text: 'text-gradient-emerald' },
  vodafone: { from: 'from-vodafone', to: 'to-vodafone-light', glow: '#e60000', text: 'text-gradient-vodafone' },
  royal: { from: 'from-royal', to: 'to-royal-light', glow: '#7c3aed', text: 'text-gradient-royal' },
};

export function StatCard({ title, label, value, icon, trend, trendLabel, gradient = 'orange', delay = 0, suffix }: StatCardProps) {
  const displayLabel = label || title || '';
  const isPreset = typeof gradient === 'string' && gradientMap[gradient as string];
  const g = isPreset ? gradientMap[gradient as string] : null;
  const customGradient = !isPreset ? (gradient as string) : '';
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (typeof value === 'number') {
      const duration = 1200;
      const start = performance.now();
      const startVal = 0;
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.floor(startVal + (value - startVal) * eased));
        if (progress < 1) requestAnimationFrame(animate);
        else setDisplayValue(value);
      };
      requestAnimationFrame(animate);
    }
  }, [value]);

  const isIconComponent = (icon && typeof icon === 'function') || (icon && typeof icon === 'object' && icon !== null && '$$typeof' in icon);
  const renderedIcon = React.isValidElement(icon)
    ? icon
    : isIconComponent
    ? React.createElement(icon as IconType, { className: 'h-7 w-7' })
    : icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      style={{ ['--glow-color' as any]: g?.glow || '#f97316' }}
    >
      <Card className="stat-glow group relative overflow-hidden p-5">
        {/* Decorative gradient blob */}
        <div className={cn(
          'absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-40 group-hover:scale-150',
          g ? cn('bg-gradient-to-br', g.from, g.to) : `bg-gradient-to-br ${customGradient}`
        )} />

        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-muted-foreground mb-2">{displayLabel}</p>
            <p className={cn('text-3xl font-black number-ticker', g?.text || 'text-gradient-luxury')}>
              {typeof value === 'number' ? displayValue.toLocaleString('ar-EG') : value}
              {suffix && <span className="text-lg mr-1">{suffix}</span>}
            </p>
            {trend !== undefined && (
              <div className="flex items-center gap-1.5 mt-3">
                {typeof trend === 'number' ? (
                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold', trend >= 0 ? 'bg-emerald2-500/15 text-emerald2-600' : 'bg-destructive/15 text-destructive')}>
                    {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(trend)}%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {trend}
                  </span>
                )}
                {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
              </div>
            )}
          </div>
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
              g ? cn(g.from, g.to) : customGradient
            )}
          >
            {renderedIcon}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
