'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VodafoneCashTxn, VodafoneTxnType } from '@/types';
import { generateTxn } from '@/lib/utils';

interface VodafoneState {
  walletPhone: string;
  balance: number;
  transactions: VodafoneCashTxn[];
  // Actions
  addTransaction: (txn: Omit<VodafoneCashTxn, 'id' | 'txn_number' | 'created_at' | 'updated_at'>) => VodafoneCashTxn;
  cancelTransaction: (id: string) => void;
  getTodayStats: () => { withdrawals: number; deposits: number; transfers: number; commissions: number };
  getByPhone: (phone: string) => VodafoneCashTxn[];
  getById: (id: string) => VodafoneCashTxn | undefined;
  adjustBalance: (amount: number) => void;
}

const isToday = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

export const useVodafoneStore = create<VodafoneState>()(
  persist(
    (set, get) => ({
      walletPhone: '01000000000',
      balance: 50000,
      transactions: [],
      addTransaction: (data) => {
        const txn: VodafoneCashTxn = {
          ...data,
          id: Math.random().toString(36).substring(2) + Date.now().toString(36),
          txn_number: generateTxn('VC'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        // Adjust balance based on type
        set((state) => {
          let balance = state.balance;
          if (txn.type === 'deposit' && txn.status === 'success') {
            balance += txn.net_amount; // customer gives cash, wallet receives
          } else if (txn.type === 'withdraw' && txn.status === 'success') {
            balance -= txn.net_amount; // wallet sends money to customer
          } else if (txn.type === 'transfer' && txn.status === 'success') {
            balance -= txn.net_amount;
          } else if (txn.type === 'bill_payment' && txn.status === 'success') {
            balance -= txn.net_amount;
          }
          return { transactions: [txn, ...state.transactions], balance };
        });
        return txn;
      },
      cancelTransaction: (id) =>
        set((state) => {
          const txn = state.transactions.find((t) => t.id === id);
          if (!txn || txn.status !== 'pending') return state;
          let balance = state.balance;
          if (txn.type === 'deposit') balance -= txn.net_amount;
          else if (txn.type === 'withdraw') balance += txn.net_amount;
          else if (txn.type === 'transfer') balance += txn.net_amount;
          else if (txn.type === 'bill_payment') balance += txn.net_amount;
          return {
            transactions: state.transactions.map((t) =>
              t.id === id ? { ...t, status: 'cancelled' as const, updated_at: new Date().toISOString() } : t
            ),
            balance,
          };
        }),
      getTodayStats: () => {
        const txns = get().transactions.filter((t) => isToday(t.created_at) && t.status === 'success');
        return {
          withdrawals: txns.filter((t) => t.type === 'withdraw').reduce((s, t) => s + t.amount, 0),
          deposits: txns.filter((t) => t.type === 'deposit').reduce((s, t) => s + t.amount, 0),
          transfers: txns.filter((t) => t.type === 'transfer').reduce((s, t) => s + t.amount, 0),
          commissions: txns.filter((t) => t.type === 'withdraw').reduce((s, t) => s + t.commission, 0),
        };
      },
      getByPhone: (phone) =>
        get().transactions.filter((t) => t.phone.includes(phone) || t.destination_wallet?.includes(phone)),
      getById: (id) => get().transactions.find((t) => t.id === id),
      adjustBalance: (amount) => set((s) => ({ balance: s.balance + amount })),
    }),
    { name: 'mhmd-vodafone' }
  )
);
