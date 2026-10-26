import { lazy, Suspense } from 'react';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import Navbar from '@/components/navbar/Navbar';
import { api } from '@/services/api';
import type { Session } from '@/services/contracts';
import { validateCatalogSearch } from './catalogSearch';
import { redirect } from '@tanstack/react-router';
import axios from 'axios';
import { Link } from '@tanstack/react-router';

const Auth = lazy(() => import('@/pages/auth/Auth'));
const loadHome = () => import('@/pages/home/Home');
const Home = lazy(loadHome);
const Market = lazy(() => import('@/pages/home/Market'));
const loadProductDetail = () => import('@/pages/nftDetails/ProductDetail');
const ProductDetail = lazy(loadProductDetail);
const Cart = lazy(() => import('@/pages/cart/Cart'));
const Checkout = lazy(() => import('@/pages/payments/Checkout'));
const OrderReceiptRoute = lazy(() => import('@/pages/payments/OrderReceiptRoute'));
const ProfilePage = lazy(() => import('@/pages/profile/AccountPages').then((module) => ({ default: module.ProfilePage })));
const WalletsPage = lazy(() => import('@/pages/profile/AccountPages').then((module) => ({ default: module.WalletsPage })));
const PageFallback = () => <div role="status" className="min-h-svh animate-pulse bg-[#140D0A]" />;

export const preloadInitialRoute = () => {
  if (window.location.pathname === '/') return loadHome();
  if (window.location.pathname.startsWith('/nft/')) return loadProductDetail();
  return Promise.resolve();
};

const rootRoute = createRootRoute({
  validateSearch: validateCatalogSearch,
  notFoundComponent: () => <main className="min-h-svh bg-[#140D0A] p-10 text-[#F5F1EB]"><h1>Página não encontrada</h1><Link to="/">Voltar ao início</Link></main>,
  errorComponent: ({ reset }) => <main className="min-h-svh bg-[#140D0A] p-10 text-[#F5F1EB]"><h1>Não foi possível carregar esta página</h1><button onClick={reset}>Tentar novamente</button></main>,
});

const requireSession = async ({ location }: { location: { href: string } }) => {
  if (!localStorage.getItem('kurio_token')) {
    throw redirect({ to: '/login', search: { redirect: location.href } });
  }
  try {
    await api.get<Session>('/auth/session');
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) throw redirect({ to: '/login', search: { redirect: location.href } });
    throw error;
  }
};

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Suspense fallback={<PageFallback />}><Home /></Suspense>,
});

const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nft/$id',
  component: () => <Suspense fallback={<PageFallback />}><ProductDetail /></Suspense>,
});

const marketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/market',
  validateSearch: validateCatalogSearch,
  component: () => <Suspense fallback={<PageFallback />}><Market /></Suspense>,
});

const creatorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/creators',
  component: () => <><Navbar /><main className="min-h-svh bg-[#140D0A] p-10 text-[#F5F1EB]"><h1>Criadores</h1><p>Conteúdo editorial fora do escopo desta demonstração.</p><Link to="/market">Explorar NFTs</Link></main></>,
});

const learnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/learn',
  component: () => <><Navbar /><main className="min-h-svh bg-[#140D0A] p-10 text-[#F5F1EB]"><h1>Aprender</h1><p>Conteúdo editorial fora do escopo desta demonstração.</p><Link to="/market">Explorar NFTs</Link></main></>,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: () => <Suspense fallback={<PageFallback />}><Cart /></Suspense>,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment',
  beforeLoad: requireSession,
  component: () => <Suspense fallback={<PageFallback />}><Checkout /></Suspense>,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation',
  beforeLoad: requireSession,
  component: () => <Suspense fallback={<PageFallback />}><OrderReceiptRoute /></Suspense>,
});

const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', beforeLoad: requireSession, component: () => <Suspense fallback={<PageFallback />}><ProfilePage /></Suspense> });
const walletsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wallets', beforeLoad: requireSession, component: () => <Suspense fallback={<PageFallback />}><WalletsPage /></Suspense> });

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
