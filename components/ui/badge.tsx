import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-500/15 text-brand-600 dark:text-brand-400',
        gold: 'border-transparent bg-gold-400/15 text-gold-700 dark:text-gold-400',
        success: 'border-transparent bg-emerald2-500/15 text-emerald2-600 dark:text-emerald2-400',
        destructive: 'border-transparent bg-destructive/15 text-destructive',
        warning: 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400',
        vodafone: 'border-transparent bg-vodafone/15 text-vodafone dark:text-vodafone-light',
        royal: 'border-transparent bg-royal/15 text-royal dark:text-royal-light',
        outline: 'text-foreground border-border',
        premium: 'border-gold-400/30 bg-gradient-to-r from-gold-400/15 to-brand-500/15 text-gold-700 dark:text-gold-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
