'use client';

import { useTranslations } from 'next-intl';
import { ExpenseForm } from '@/components/expense-form';
import { ExpenseList } from '@/components/expense-list';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ExpenseChart } from '@/components/analytics/expense-chart';
import { ExportButton } from '@/components/data-export/export-button';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('common.expenses')}</h1>
          <div className="flex items-center gap-4">
            <ExportButton />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[350px,1fr]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t('common.add')}</h2>
            <ExpenseForm />
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">{t('analytics.monthlyExpenses')}</h2>
              <ExpenseChart />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">{t('common.list')}</h2>
              <ExpenseList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}