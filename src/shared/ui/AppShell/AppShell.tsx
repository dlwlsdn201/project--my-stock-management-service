import type { ReactNode } from 'react';

type AppShellProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
};

export const AppShell = ({ sidebar, header, children }: AppShellProps) => (
  <div className="flex h-screen overflow-hidden bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
      {sidebar}
    </aside>
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 px-6 dark:border-gray-800">
        {header}
      </header>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  </div>
);
