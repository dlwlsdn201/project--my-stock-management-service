import type { ReactNode } from 'react';

interface AppShellProps {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}

export const AppShell = ({ header, sidebar, children }: AppShellProps) => (
  <div className="flex h-screen flex-col overflow-hidden bg-[hsl(var(--background))]">
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius)] focus:bg-[hsl(var(--primary))] focus:px-3 focus:py-2 focus:text-sm focus:text-[hsl(var(--primary-foreground))]"
    >
      본문으로 건너뛰기
    </a>
    {header}
    <div className="flex flex-1 overflow-hidden max-lg:flex-col">
      {sidebar}
      <main id="main-content" className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  </div>
);
