'use client';

import { useCallback, useEffect } from 'react';
import { Database } from '@/types/database';

type Expense = Database['public']['Tables']['expenses']['Row'];

export function useOfflineStorage() {
  const STORAGE_KEY = 'offline_expenses';

  const saveOfflineExpense = useCallback(async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const offlineExpenses = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      offlineExpenses.push({
        ...expense,
        id: `offline_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offlineExpenses));
    } catch (error) {
      console.error('Error saving offline expense:', error);
    }
  }, []);

  const syncOfflineExpenses = useCallback(async () => {
    try {
      const offlineExpenses = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (offlineExpenses.length === 0) return;

      // Implement sync logic here when online
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error syncing offline expenses:', error);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('online', syncOfflineExpenses);
    return () => window.removeEventListener('online', syncOfflineExpenses);
  }, [syncOfflineExpenses]);

  return {
    saveOfflineExpense,
    syncOfflineExpenses,
  };
}