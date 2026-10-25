import { useMemo, useState } from 'react';
import { useLocation, useRouterState } from '@tanstack/react-router';
import ProductCatalog from './ProductCatalog';
import ProductSidebar from './ProductSidebar';
import { initialPriceRange, nfts, type SortOrder, type TabId } from './productData';
import { router, type CatalogSearch } from '@/routes';

const pageSize = 9;
const emptyNetworks: string[] = [];

const Products = () => {
  const search = useRouterState({ select: (state) => state.location.search });

  return <ProductsContent key={JSON.stringify(search)} search={search} />;
};

const ProductsContent = ({ search }: { search: CatalogSearch }) => {
  const location = useLocation();
  const updateSearch = (updater: (previous: CatalogSearch) => CatalogSearch) => {
    if (location.pathname === '/market') {
      void router.navigate({ to: '/market', search: updater });
    } else {
      void router.navigate({ to: '/', search: updater });
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

  const filteredNfts = useMemo(() => {
    const filtered = nfts.filter((nft) => {
      const query = search.q?.toLocaleLowerCase() ?? '';
      const matchesQuery =
        !query ||
        nft.name.toLocaleLowerCase().includes(query) ||
        String(nft.id).includes(query) ||
        String(nft.id).padStart(3, '0').includes(query);
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'new' && nft.isNew) ||
        (activeTab === 'trending' && nft.isTrending);
      const matchesCategory = !selectedCategory || nft.category === selectedCategory;
      const matchesNetwork =
        selectedNetworks.length === 0 || selectedNetworks.includes(nft.network);
      const matchesPrice = nft.price >= priceRange.min && nft.price <= priceRange.max;

      return matchesQuery && matchesTab && matchesCategory && matchesNetwork && matchesPrice;
    });

    if (sortOrder === 'price-asc') return filtered.sort((a, b) => a.price - b.price);
    if (sortOrder === 'price-desc') return filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }, [activeTab, priceRange.max, priceRange.min, search.q, selectedCategory, selectedNetworks, sortOrder]);

  const pageCount = Math.max(3, Math.ceil(filteredNfts.length / pageSize));
  const pageProducts = filteredNfts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
      className="mx-auto grid w-full max-w-360 grid-cols-1 items-start gap-6 px-4 pb-16 font-mono sm:px-6 md:grid-cols-[270px_minmax(0,1fr)] md:gap-10 lg:px-27.5"
    >
      <ProductSidebar
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
        products={pageProducts}
        activeTab={activeTab}
        sortOrder={sortOrder}
        currentPage={currentPage}
        pageCount={pageCount}
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