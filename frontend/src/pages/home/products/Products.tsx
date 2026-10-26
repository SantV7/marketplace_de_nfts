import { useMemo, useState } from 'react';
import { useLocation, useRouterState } from '@tanstack/react-router';
import ProductCatalog from './ProductCatalog';
import ProductSidebar from './ProductSidebar';
import { initialPriceRange, type SortOrder, type TabId } from './productData';
import { router } from '@/routes';
import type { CatalogSearch } from '@/routes/catalogSearch';
import { useNfts } from '@/services/queries';
import type { Nft } from '@/services/contracts';

const pageSize = 9;
const emptyNetworks: string[] = [];

interface ProductsProps {
  mobileFiltersOpen?: boolean;
  onMobileFiltersClose?: () => void;
}

const Products = ({
  mobileFiltersOpen = false,
  onMobileFiltersClose,
}: ProductsProps) => {
  const search = useRouterState({ select: (state) => state.location.search });

  return (
    <ProductsContent
      key={JSON.stringify(search)}
      search={search}
      mobileFiltersOpen={mobileFiltersOpen}
      onMobileFiltersClose={onMobileFiltersClose}
    />
  );
};

const ProductsContent = ({
  search,
  mobileFiltersOpen,
  onMobileFiltersClose,
}: {
  search: CatalogSearch;
  mobileFiltersOpen: boolean;
  onMobileFiltersClose?: () => void;
}) => {
  const location = useLocation();
  const updateSearch = (updater: (previous: CatalogSearch) => CatalogSearch) => {
    if (location.pathname === '/market') {
      void router.navigate({ to: '/market', search: updater, resetScroll: false });
    } else {
      void router.navigate({ to: '/', search: updater, resetScroll: false });
    }
  };
  const [draftPriceRange, setDraftPriceRange] = useState({
    min: search.min ?? initialPriceRange.min,
    max: search.max ?? initialPriceRange.max,
  });

  const activeTab: TabId = search.tab ?? 'all';
  const selectedCategory = search.category ?? null;
  const selectedNetworks = search.network ?? emptyNetworks;
  const priceRange = {
    min: search.min ?? initialPriceRange.min,
    max: search.max ?? initialPriceRange.max,
  };
  const sortOrder: SortOrder = search.sort ?? 'recent';
  const currentPage = search.page ?? 1;

  const query = useNfts({ search: search.q, category: selectedCategory ?? undefined, network: selectedNetworks, min: priceRange.min, max: priceRange.max, sort: sortOrder, tab: activeTab, page: currentPage, limit: pageSize });
  const pageProducts = query.data?.data ?? [];
  const pageCount = Math.max(1, query.data?.pageCount ?? 1);
  const counts = useNfts({ limit: 100 });
  const categories = useMemo(() => [...new Set((counts.data?.data ?? []).map((nft) => nft.category))].map((name) => ({ name, count: (counts.data?.data ?? []).filter((nft) => nft.category === name).length })), [counts.data]);
  const networks = useMemo(() => [...new Set((counts.data?.data ?? []).map((nft) => nft.network))].map((name) => ({ name, count: (counts.data?.data ?? []).filter((nft) => nft.network === name).length })), [counts.data]);

  const toggleNetwork = (network: string) => {
    updateSearch((previous) => {
      const currentNetworks = previous.network ?? emptyNetworks;
      const nextNetworks = currentNetworks.includes(network)
        ? currentNetworks.filter((selected) => selected !== network)
        : [...currentNetworks, network];

      return { ...previous, network: nextNetworks.length ? nextNetworks : undefined, page: undefined };
    });
  };

  const selectCategory = (category: string) => {
    updateSearch((previous) => ({
      ...previous,
      category: previous.category === category ? undefined : category,
      page: undefined,
    }));
  };

  return (
    <section
      aria-label="Explorar NFTs"
      className="mx-auto grid w-full max-w-360 grid-cols-1 items-start gap-5 px-6 pb-28 pt-4 font-mono md:grid-cols-[270px_minmax(0,1fr)] md:gap-10 md:px-6 md:pb-16 md:pt-0 lg:px-27.5"
    >
      <ProductSidebar
        categories={categories}
        networks={networks}
        mobileOpen={mobileFiltersOpen}
        onMobileClose={onMobileFiltersClose}
        selectedCategory={selectedCategory}
        selectedNetworks={selectedNetworks}
        draftPriceRange={draftPriceRange}
        priceRange={priceRange}
        onSelectCategory={selectCategory}
        onToggleNetwork={toggleNetwork}
        onDraftPriceChange={setDraftPriceRange}
        onApplyPriceRange={() => {
          updateSearch((previous) => ({
            ...previous,
            min:
              draftPriceRange.min === initialPriceRange.min
                ? undefined
                : draftPriceRange.min,
            max:
              draftPriceRange.max === initialPriceRange.max
                ? undefined
                : draftPriceRange.max,
            page: undefined,
          }));
        }}
      />
      <ProductCatalog
        products={pageProducts as Nft[]}
        activeTab={activeTab}
        sortOrder={sortOrder}
        currentPage={currentPage}
        pageCount={pageCount}
        loading={query.isLoading}
        error={query.isError ? 'Não foi possível carregar os NFTs.' : ''}
        onTabChange={(tab) =>
          updateSearch((previous) => ({
            ...previous,
            tab: tab === 'all' ? undefined : tab,
            page: undefined,
          }))
        }
        onSortChange={(sort) =>
          updateSearch((previous) => ({
            ...previous,
            sort: sort === 'recent' ? undefined : sort,
            page: undefined,
          }))
        }
        onPageChange={(page) =>
          updateSearch((previous) => ({ ...previous, page: page === 1 ? undefined : page }))
        }
      />
    </section>
  );
};

export default Products;
