'use client';

import { useTranslations } from 'next-intl';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenses } from '@/hooks/use-expenses';

export function ExpenseChart() {
  const t = useTranslations();
  const { expenses, formatCurrency } = useExpenses();

  // Process data for the chart
  const monthlyData = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthYear = date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    acc[monthYear] = (acc[monthYear] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('analytics.monthlyExpenses')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                padding={{ left: 30, right: 30 }}
              />
              <YAxis
                width={80}
                tickFormatter={(value) => formatCurrency(value)}
                allowDecimals={false}
                allowDataOverflow={false}
                scale="auto"
                domain={['auto', 'auto']}
                padding={{ top: 20, bottom: 20 }}
                orientation="left"
                type="number"
                yAxisId={0}
                minTickGap={5}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), 'Amount']}
                labelStyle={{ color: 'black' }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                yAxisId={0}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}