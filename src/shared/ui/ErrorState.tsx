import type { ReactNode } from 'react';

interface ErrorStateProps {
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const ErrorState = ({
  title = '문제가 발생했습니다',
  description,
  action,
  className = '',
}: ErrorStateProps) => (
  <div
    role="alert"
    className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${className}`}
  >
    <p className="text-lg font-medium text-red-600">{title}</p>
    <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);
