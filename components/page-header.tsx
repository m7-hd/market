'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type IconType = React.ComponentType<{ className?: string }>;

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: IconType | React.ReactNode;
  gradient?: string;
  actions?: React.ReactNode;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

export function PageHeader({ title, description, icon, gradient = 'from-brand-500 to-gold-400', actions, action, badge }: PageHeaderProps) {
  const isIconComponent = (icon && typeof icon === 'function') || (icon && typeof icon === 'object' && icon !== null && '$$typeof' in icon);
  const renderedIcon = React.isValidElement(icon)
    ? icon
    : isIconComponent
    ? React.createElement(icon as IconType, { className: 'h-7 w-7' })
    : icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between flex-wrap gap-4 mb-6"
    >
      <div className="flex items-center gap-4">
        {icon && (
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            className={cn('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', gradient)}
          >
            {renderedIcon}
          </motion.div>
        )}
        <div>
          <h1 className="text-2xl font-black text-gradient-luxury flex items-center gap-2">
            {title}
            {badge && <span className="text-xl">{badge}</span>}
          </h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {(actions || action) && <div className="flex items-center gap-2 flex-wrap">{actions || action}</div>}
    </motion.div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: IconType | React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  const isIconComponent = (icon && typeof icon === 'function') || (icon && typeof icon === 'object' && icon !== null && '$$typeof' in icon);
  const renderedIcon = React.isValidElement(icon)
    ? icon
    : isIconComponent
    ? React.createElement(icon as IconType, { className: 'h-10 w-10' })
    : icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {icon && (
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/50 text-muted-foreground mb-4 animate-float">
          {renderedIcon}
        </div>
      )}
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
