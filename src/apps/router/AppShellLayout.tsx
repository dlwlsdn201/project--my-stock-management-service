import { Outlet } from 'react-router-dom';
import { NAV_ITEMS, useTheme } from '@shared';
import { AppHeader } from '@widgets/app-header';
import { AppSidebar } from '@widgets/app-sidebar';
import { AppShell } from '@widgets/app-shell';

interface AppShellLayoutProps {
  routePath: string;
}

export const AppShellLayout = ({ routePath }: AppShellLayoutProps) => {
  const { theme, toggleTheme } = useTheme();
  const navItem = NAV_ITEMS.find((item) => item.path === routePath);

  return (
    <AppShell
      header={
        <AppHeader
          title={navItem?.label ?? ''}
          description={navItem?.description}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      }
      sidebar={<AppSidebar />}
    >
      <Outlet />
    </AppShell>
  );
};
