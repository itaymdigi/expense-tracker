'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useExpenses } from '@/hooks/use-expenses';

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export function ExpenseForm() {
  const t = useTranslations();
  const { toast } = useToast();
  const { addExpense, formatCurrency } = useExpenses();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      setLoading(true);
      
      const expenseData = {
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        date: data.date,
        user_id: 'default-user',
      };
      
      await addExpense(expenseData);
      
      toast({
        title: t('common.success'),
        description: `${t('expenses.added')} - ${formatCurrency(expenseData.amount)}`,
      });
      
      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('expenses.error'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">{t('common.amount')} (₪)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register('amount', { 
            valueAsNumber: true,
            required: true,
          })}
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">{t('common.category')}</Label>
        <Select
          onValueChange={(value) => setValue('category', value)}
          value={watch('category')}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('common.selectCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="groceries">{t('categories.groceries')}</SelectItem>
            <SelectItem value="household">{t('categories.household')}</SelectItem>
            <SelectItem value="utilities">{t('categories.utilities')}</SelectItem>
            <SelectItem value="transportation">{t('categories.transportation')}</SelectItem>
            <SelectItem value="other">{t('categories.other')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('common.description')}</Label>
        <Input 
          id="description" 
          {...register('description', { required: true })}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">{t('common.date')}</Label>
        <div className="relative">
          <Input
            id="date"
            type="date"
            {...register('date', { required: true })}
          />
          <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t('common.saving') : t('common.save')}
      </Button>
    </form>
  );
}