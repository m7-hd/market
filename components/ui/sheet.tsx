'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== Sub-components for compound API =====

export function SheetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>;
}

export function SheetTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-xl font-bold text-gradient-luxury', className)}>{children}</h2>;
}

export function SheetDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-muted-foreground mt-1', className)}>{children}</p>;
}

// SheetTrigger is a passthrough for API compatibility (renders children as-is)
export function SheetTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return <>{children}</>;
}

// Context to allow SheetContent to close the sheet
const SheetCloseContext = React.createContext<(() => void) | null>(null);

export function SheetContent({
  side = 'right',
  className,
  children,
}: {
  side?: 'right' | 'left' | 'top' | 'bottom';
  className?: string;
  children: React.ReactNode;
}) {
  const direction = {
    right: { x: '100%' },
    left: { x: '-100%' },
    top: { y: '-100%' },
    bottom: { y: '100%' },
  }[side];

  const close = React.useContext(SheetCloseContext);

  return (
    <motion.div
      initial={direction}
      animate={{ x: 0, y: 0 }}
      exit={direction}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className={cn(
        'fixed z-50 glass-strong shadow-luxury p-6 overflow-y-auto',
        side === 'right' && 'right-0 top-0 h-full w-full sm:max-w-lg',
        side === 'left' && 'left-0 top-0 h-full w-full sm:max-w-lg',
        side === 'top' && 'left-0 top-0 w-full h-auto',
        side === 'bottom' && 'left-0 bottom-0 w-full h-auto',
        className
      )}
    >
      {close && (
        <button
          onClick={close}
          className="absolute top-4 left-4 rounded-lg p-2 hover:bg-muted transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      {children}
    </motion.div>
  );
}

// ===== Main Sheet component (supports both APIs) =====

interface SheetProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  side?: 'right' | 'left' | 'top' | 'bottom';
  children: React.ReactNode;
  className?: string;
}

export function Sheet({ open, onClose, onOpenChange, title, description, side = 'right', children, className }: SheetProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  const direction = {
    right: { x: '100%' },
    left: { x: '-100%' },
    top: { y: '-100%' },
    bottom: { y: '100%' },
  }[side];

  if (!mounted) return null;

  // Check if children include SheetContent (compound API)
  const hasSheetContent = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === SheetContent
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          {hasSheetContent ? (
            <SheetCloseContext.Provider value={handleClose}>{children}</SheetCloseContext.Provider>
          ) : (
            <motion.div
              initial={direction}
              animate={{ x: 0, y: 0 }}
              exit={direction}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                'fixed z-50 glass-strong shadow-luxury p-6 overflow-y-auto',
                side === 'right' && 'right-0 top-0 h-full w-full sm:max-w-lg',
                side === 'left' && 'left-0 top-0 h-full w-full sm:max-w-lg',
                side === 'top' && 'left-0 top-0 w-full h-auto',
                side === 'bottom' && 'left-0 bottom-0 w-full h-auto',
                className
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  {title && <h2 className="text-xl font-bold text-gradient-luxury">{title}</h2>}
                  {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                </div>
                <button onClick={handleClose} className="rounded-lg p-2 hover:bg-muted transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {children}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
