import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@shared';

export const AppSidebar = () => (
  <nav aria-label="Main navigation" className="flex h-full flex-col py-6">
    <div className="px-6 pb-6">
      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">AssetFlow AI</span>
    </div>
    <ul className="flex-1 space-y-1 px-3">
      {NAV_ITEMS.map((item) => (
        <li key={item.id}>
          <NavLink
            to={item.route}
            className={({ isActive }) =>
              [
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);
