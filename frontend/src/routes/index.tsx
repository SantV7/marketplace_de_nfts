import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import Navbar from '@/components/Navbar';
import Home from '@/pages/home/Home';

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Home />,
});

const marketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/market',
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === 'string' ? { q: search.q } : {},
  component: () => <Navbar />,
});

const creatorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/creators',
  component: () => <Navbar />,
});

const learnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/learn',
  component: () => <Navbar />,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: () => <Navbar />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <Navbar />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  marketRoute,
  creatorsRoute,
  learnRoute,
  cartRoute,
  loginRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}