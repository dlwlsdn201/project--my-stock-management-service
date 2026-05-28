import type { HTMLAttributes } from 'react';

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div';
}

export const Surface = ({ as: Tag = 'div', className = '', children, ...props }: SurfaceProps) => (
  <Tag
    className={`rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-4 ${className}`}
    {...props}
  >
    {children}
  </Tag>
);
