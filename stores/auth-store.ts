'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, UserRole } from '@/types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  permissions: string[];
  login: (user: UserProfile) => void;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

// Full permissions matrix
export const ALL_PERMISSIONS = [
  'dashboard.view',
  'pos.use',
  'pos.refund',
  'pos.discount',
  'vodafone.view',
  'vodafone.deposit',
  'vodafone.withdraw',
  'vodafone.transfer',
  'vodafone.bills',
  'vodafone.reports',
  'products.view',
  'products.create',
  'products.edit',
  'products.delete',
  'inventory.view',
  'inventory.transfer',
  'inventory.count',
  'inventory.adjust',
  'suppliers.view',
  'suppliers.create',
  'suppliers.payments',
  'customers.view',
  'customers.create',
  'customers.edit',
  'offers.manage',
  'loyalty.manage',
  'orders.view',
  'orders.manage',
  'reports.view',
  'employees.view',
  'employees.manage',
  'settings.manage',
  'notifications.send',
] as const;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [...ALL_PERMISSIONS],
  manager: [
    'dashboard.view', 'pos.use', 'pos.refund', 'pos.discount',
    'vodafone.view', 'vodafone.deposit', 'vodafone.withdraw', 'vodafone.transfer', 'vodafone.bills', 'vodafone.reports',
    'products.view', 'products.create', 'products.edit',
    'inventory.view', 'inventory.transfer', 'inventory.count',
    'suppliers.view', 'suppliers.create', 'suppliers.payments',
    'customers.view', 'customers.create', 'customers.edit',
    'offers.manage', 'loyalty.manage',
    'orders.view', 'orders.manage',
    'reports.view', 'employees.view',
    'notifications.send',
  ],
  cashier: [
    'dashboard.view', 'pos.use', 'pos.discount',
    'vodafone.view', 'vodafone.deposit', 'vodafone.withdraw', 'vodafone.transfer', 'vodafone.bills',
    'products.view',
    'customers.view', 'customers.create',
    'orders.view',
  ],
  warehouse: [
    'dashboard.view',
    'products.view', 'products.create', 'products.edit',
    'inventory.view', 'inventory.transfer', 'inventory.count', 'inventory.adjust',
    'suppliers.view',
  ],
  accountant: [
    'dashboard.view',
    'vodafone.view', 'vodafone.reports',
    'suppliers.view', 'suppliers.payments',
    'customers.view',
    'reports.view',
  ],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      permissions: [],
      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          permissions: ROLE_PERMISSIONS[user.role] || [],
        }),
      logout: () => set({ user: null, isAuthenticated: false, permissions: [] }),
      hasPermission: (perm) => {
        const { permissions, user } = get();
        if (user?.role === 'admin') return true;
        return permissions.includes(perm);
      },
      hasRole: (...roles) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },
    }),
    { name: 'mhmd-auth' }
  )
);
