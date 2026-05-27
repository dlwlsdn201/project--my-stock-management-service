import type { ReactNode } from 'react';

type MetricCardTrend = 'up' | 'down' | 'neutral';

type MetricCardProps = {
  label: string;
  value: string;
  description?: string;
  trend?: MetricCardTrend;
  action?: ReactNode;
};

const trendValueClass: Record<MetricCardTrend, string> = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-900 dark:text-gray-100',
};

export const MetricCard = ({
  label,
  value,
  description,
  trend = 'neutral',
  action,
}: MetricCardProps) => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`mt-2 text-3xl font-bold ${trendValueClass[trend]}`}>{value}</p>
    {description && (
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
