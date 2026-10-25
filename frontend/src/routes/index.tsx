import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import Home from '@/pages/home/Home';
import Products from '@/pages/home/products/Products';
import ProductDetail from '@/pages/nftDetails/ProductDetail';
import Cart from '@/pages/cart/Cart';
import Checkout from '@/pages/payments/Checkout';
import DemoOrderConfirmation from '@/pages/payments/DemoOrderConfirmation';

const validTabs = ['all', 'new', 'trending'] as const;
const validSortOrders = ['recent', 'price-asc', 'price-desc'] as const;
const validNetworks = ['Ethereum', 'Polygon', 'Solana'] as const;
const validNetworkSet = new Set<string>(validNetworks);

export type CatalogSearch = {
  q?: string;
  category?: string;
  network?: string[];
  min?: number;
  max?: number;
  sort?: (typeof validSortOrders)[number];
  tab?: (typeof validTabs)[number];
  page?: number;
  coupon?: string;
};

export const validateCatalogSearch = (search: Record<string, unknown>): CatalogSearch => {
  const query = typeof search.q === 'string' ? search.q.trim() : '';
  const category = typeof search.category === 'string' ? search.category : '';
  const networks = Array.isArray(search.network)
    ? search.network.filter(
        (network): network is string =>
          typeof network === 'string' && validNetworkSet.has(network),
      )
    : typeof search.network === 'string' && validNetworkSet.has(search.network)
      ? [search.network]
      : [];
  const min = Number(search.min);
  const max = Number(search.max);
  const page = Number(search.page);
  const sort = validSortOrders.find((order) => order === search.sort);
  const tab = validTabs.find((value) => value === search.tab);
  const coupon = typeof search.coupon === 'string' ? search.coupon.trim().toUpperCase() : '';

  return {
    ...(query ? { q: query } : {}),
    ...(category ? { category } : {}),
    ...(networks.length ? { network: networks } : {}),
    ...(Number.isFinite(min) && min >= 0 ? { min } : {}),
    ...(Number.isFinite(max) && max > 0 ? { max } : {}),
    ...(sort ? { sort } : {}),
    ...(tab ? { tab } : {}),
    ...(Number.isInteger(page) && page > 0 ? { page } : {}),
    ...(coupon ? { coupon } : {}),
  };
};

const rootRoute = createRootRoute({
  validateSearch: validateCatalogSearch,
});

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
  component: () => (
    <main className="min-h-screen bg-[#140D0A]">
      <Navbar />
      <Products />
      <Footer />
    </main>
  ),
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
  component: Cart,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment',
  component: Checkout,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation',
  component: DemoOrderConfirmation,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <Navbar />,
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
  loginRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}