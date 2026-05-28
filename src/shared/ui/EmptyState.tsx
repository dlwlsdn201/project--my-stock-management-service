import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ title, description, action, className = '' }: EmptyStateProps) => (
  <div className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${className}`}>
    <p className="text-lg font-medium">{title}</p>
    <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);
