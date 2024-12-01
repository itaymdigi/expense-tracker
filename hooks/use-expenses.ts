'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Expense = Database['public']['Tables']['expenses']['Row'];
type NewExpense = Omit<Expense, 'id' | 'created_at' | 'updated_at'>;

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch expenses'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();

    const channel = supabase
      .channel('expenses_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
        },
        (payload) => {
          console.log('Real-time update:', payload);
          if (payload.eventType === 'INSERT') {
            setExpenses((current) => [payload.new as Expense, ...current]);
          } else if (payload.eventType === 'DELETE') {
            setExpenses((current) => 
              current.filter((expense) => expense.id !== payload.old.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            setExpenses((current) =>
              current.map((expense) =>
                expense.id === payload.new.id ? payload.new as Expense : expense
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchExpenses]);

  const addExpense = async (expense: NewExpense) => {
    try {
      const parsedAmount = typeof expense.amount === 'string' 
        ? parseFloat(expense.amount) 
        : expense.amount;

      if (isNaN(parsedAmount)) {
        throw new Error('Invalid amount');
      }

      const formattedExpense = {
        ...expense,
        amount: parsedAmount,
        date: new Date(expense.date).toISOString().split('T')[0],
        user_id: expense.user_id || 'default-user',
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert(formattedExpense)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      console.error('Error in addExpense:', err);
      throw err instanceof Error ? err : new Error('Failed to add expense');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
    }).format(amount);
  };

  return {
    expenses,
    loading,
    error,
    addExpense,
    formatCurrency,
  };
}