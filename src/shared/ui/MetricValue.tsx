interface MetricValueProps {
  label: string;
  value: string;
  description?: string;
  className?: string;
}

export const MetricValue = ({ label, value, description, className = '' }: MetricValueProps) => (
  <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
    <span className="text-xs text-[hsl(var(--muted-foreground))]">{label}</span>
    <span className="text-2xl font-semibold break-words tabular-nums">{value}</span>
    {description && (
      <span className="break-words text-xs text-[hsl(var(--muted-foreground))]">{description}</span>
    )}
  </div>
);
