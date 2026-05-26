import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router';
import './styles/index.css';

export const App = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};
