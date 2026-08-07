import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format currency in EGP */
export function formatCurrency(amount: number, currency = 'EGP'): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

/** Format number with Arabic locale */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-EG').format(num || 0);
}

/** Format date in Arabic */
export function formatDate(date: Date | string, withTime = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(withTime && { hour: '2-digit', minute: '2-digit' }),
  }).format(d);
}

/** Format time */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}

/** Generate transaction number */
export function generateTxn(prefix = 'TXN'): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}${rand}`;
}

/** Generate barcode (EAN-13 style) */
export function generateBarcode(): string {
  let code = '';
  for (let i = 0; i < 13; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

/** Calculate percentage */
export function percentage(value: number, total: number): number {
  if (!total) return 0;
  return (value / total) * 100;
}

/** Debounce */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Initials from name */
export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Clamp number */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Random ID */
export function uid(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
