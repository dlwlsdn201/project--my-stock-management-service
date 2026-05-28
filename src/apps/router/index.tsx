import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { APP_ROUTES } from './routes.config';

const router = createBrowserRouter(APP_ROUTES);

export const AppRouter = () => <RouterProvider router={router} />;
