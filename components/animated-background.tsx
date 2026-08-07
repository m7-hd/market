'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

/**
 * Luxury animated background with aurora gradient blobs + grid.
 * Lightweight, pure CSS/Framer — no heavy particle engine.
 */
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base mesh gradient */}
      <div className="absolute inset-0 mesh-bg" />

      {/* Animated aurora blobs */}
      <motion.div
        className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-brand-500/30 to-gold-400/20 blur-[120px]"
        animate={{ x: [0, 80, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -left-40 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-royal/25 to-brand-500/15 blur-[120px]"
        animate={{ x: [0, -60, 0], y: [0, 80, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-emerald2-500/20 to-royal/15 blur-[120px]"
        animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />
    </div>
  );
}
