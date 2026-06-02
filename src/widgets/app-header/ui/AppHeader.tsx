import { LogoutButton } from '@features/auth-logout';
import type { Theme } from '@shared';

interface AppHeaderProps {
  title: string;
  description?: string;
  theme: Theme;
  onToggleTheme: () => void;
  showLogout?: boolean;
}

export const AppHeader = ({ title, description, theme, onToggleTheme, showLogout = false }: AppHeaderProps) => {
  const isDark = theme === 'dark';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6">
      <div className="flex flex-col justify-center">
        <h1 className="text-base font-semibold leading-tight">{title}</h1>
        {description && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={isDark}
          onClick={onToggleTheme}
          className="rounded-[var(--radius)] px-3 py-1.5 text-sm font-medium hover:bg-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          {isDark ? 'Dark' : 'Light'}
        </button>
        {showLogout && <LogoutButton />}
      </div>
    </header>
  );
};
