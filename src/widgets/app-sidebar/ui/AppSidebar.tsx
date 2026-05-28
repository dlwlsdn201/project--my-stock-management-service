import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, type NavItem } from '@shared';

const SidebarLink = ({ item }: { item: NavItem }) => {
  const { pathname } = useLocation();
  const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

  return (
    <Link
      to={item.path}
      aria-current={isActive ? 'page' : undefined}
      className={`rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] ${
        isActive
          ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
          : 'hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]'
      }`}
    >
      {item.label}
    </Link>
  );
};

export const AppSidebar = () => (
  <nav
    aria-label="Main navigation"
    className="flex w-56 shrink-0 flex-col gap-1 border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 max-lg:w-full max-lg:flex-row max-lg:border-b max-lg:border-r-0"
  >
    {NAV_ITEMS.map((item) => (
      <SidebarLink key={item.path} item={item} />
    ))}
  </nav>
);
