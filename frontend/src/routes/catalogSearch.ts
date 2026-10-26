const validTabs = ['all', 'new', 'trending'] as const;
const validSortOrders = ['recent', 'price-asc', 'price-desc'] as const;
const validNetworks = ['Ethereum', 'Polygon', 'Solana'] as const;
const validNetworkSet = new Set<string>(validNetworks);

export type CatalogSearch = { q?: string; category?: string; network?: string[]; min?: number; max?: number; sort?: (typeof validSortOrders)[number]; tab?: (typeof validTabs)[number]; page?: number; coupon?: string; redirect?: string };

export const validateCatalogSearch = (search: Record<string, unknown>): CatalogSearch => {
  const query = typeof search.q === 'string' ? search.q.trim() : '';
  const category = typeof search.category === 'string' ? search.category : '';
  const networks = Array.isArray(search.network) ? search.network.filter((network): network is string => typeof network === 'string' && validNetworkSet.has(network)) : typeof search.network === 'string' && validNetworkSet.has(search.network) ? [search.network] : [];
  const min = Number(search.min); const max = Number(search.max); const page = Number(search.page);
  const sort = validSortOrders.find((order) => order === search.sort); const tab = validTabs.find((value) => value === search.tab);
  const coupon = typeof search.coupon === 'string' ? search.coupon.trim().toUpperCase() : '';
  const redirect = typeof search.redirect === 'string' && search.redirect.startsWith('/') && !search.redirect.startsWith('//') ? search.redirect : '';
  return { ...(query ? { q: query } : {}), ...(category ? { category } : {}), ...(networks.length ? { network: networks } : {}), ...(Number.isFinite(min) && min >= 0 ? { min } : {}), ...(Number.isFinite(max) && max > 0 ? { max } : {}), ...(sort ? { sort } : {}), ...(tab ? { tab } : {}), ...(Number.isInteger(page) && page > 0 ? { page } : {}), ...(coupon ? { coupon } : {}), ...(redirect ? { redirect } : {}) };
};
