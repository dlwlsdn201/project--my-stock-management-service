interface MetricValueProps {
  label: string;
  value: string;
  description?: string;
  className?: string;
}

export const MetricValue = ({ label, value, description, className = '' }: MetricValueProps) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <span className="text-xs text-[hsl(var(--muted-foreground))]">{label}</span>
    <span className="text-2xl font-semibold">{value}</span>
    {description && (
      <span className="text-xs text-[hsl(var(--muted-foreground))]">{description}</span>
    )}
  </div>
);
