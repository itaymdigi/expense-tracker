'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExpenses } from '@/hooks/use-expenses';

export function ExportButton() {
  const t = useTranslations();
  const { expenses } = useExpenses();
  const [loading, setLoading] = useState(false);

  const exportData = async () => {
    try {
      setLoading(true);
      const csvContent = [
        ['Date', 'Category', 'Description', 'Amount'].join(','),
        ...expenses.map(expense => [
          expense.date,
          expense.category,
          `"${expense.description}"`,
          expense.amount
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportData}
      disabled={loading}
    >
      <Download className="h-4 w-4 mr-2" />
      {loading ? t('common.exporting') : t('common.export')}
    </Button>
  );
}