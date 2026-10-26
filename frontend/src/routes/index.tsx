import { lazy, Suspense } from 'react';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import Navbar from '@/components/navbar/Navbar';
import Home from '@/pages/home/Home';
import Market from '@/pages/home/Market';
import ProductDetail from '@/pages/nftDetails/ProductDetail';
import Cart from '@/pages/cart/Cart';
import Checkout from '@/pages/payments/Checkout';
import OrderReceiptRoute from '@/pages/payments/OrderReceiptRoute';
import { api } from '@/services/api';
import type { Session } from '@/services/contracts';
import { ProfilePage, WalletsPage } from '@/pages/profile/AccountPages';
import { validateCatalogSearch } from './catalogSearch';
import { redirect } from '@tanstack/react-router';


const Auth = lazy(() => import('@/pages/auth/Auth'));


const rootRoute = createRootRoute({
  validateSearch: validateCatalogSearch,
});

const requireSession = async ({ location }: { location: { href: string } }) => {
  if (!localStorage.getItem('kurio_token')) {
    throw redirect({ to: '/login', search: { redirect: location.href } });
  }
  try {
    await api.get<Session>('/auth/session');
  } catch {
    localStorage.removeItem('kurio_token');
    throw redirect({ to: '/login', search: { redirect: location.href } });
  }
};

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Home />,
});

const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nft/$id',
  component: () => <ProductDetail />,
});

const marketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/market',
  validateSearch: validateCatalogSearch,
  component: Market,
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
  beforeLoad: requireSession,
  component: Cart,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment',
  beforeLoad: requireSession,
  component: Checkout,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation',
  beforeLoad: requireSession,
  component: OrderReceiptRoute,
});

const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', beforeLoad: requireSession, component: ProfilePage });
const walletsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wallets', beforeLoad: requireSession, component: WalletsPage });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <Suspense fallback={<div className="min-h-svh bg-[#140D0A]" />}>
      <Auth />
    </Suspense>
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => (
    <Suspense fallback={<div className="min-h-svh bg-[#140D0A]" />}>
      <Auth />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  nftDetailRoute,
  marketRoute,
  creatorsRoute,
  learnRoute,
  cartRoute,
  paymentRoute,
  orderConfirmationRoute,
  profileRoute,
  walletsRoute,
  loginRoute,
  registerRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
