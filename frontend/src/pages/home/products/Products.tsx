import { useMemo, useState } from 'react';
import ProductCatalog from './ProductCatalog';
import ProductSidebar from './ProductSidebar';
import { initialPriceRange, nfts, type SortOrder, type TabId } from './productData';

const pageSize = 9;

const Products = () => {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [draftPriceRange, setDraftPriceRange] = useState(initialPriceRange);
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredNfts = useMemo(() => {
    const filtered = nfts.filter((nft) => {
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'new' && nft.isNew) ||
        (activeTab === 'trending' && nft.isTrending);
      const matchesCategory = !selectedCategory || nft.category === selectedCategory;
      const matchesNetwork =
        selectedNetworks.length === 0 || selectedNetworks.includes(nft.network);
      const matchesPrice = nft.price >= priceRange.min && nft.price <= priceRange.max;

      return matchesTab && matchesCategory && matchesNetwork && matchesPrice;
    });

    if (sortOrder === 'price-asc') return filtered.sort((a, b) => a.price - b.price);
    if (sortOrder === 'price-desc') return filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }, [activeTab, priceRange, selectedCategory, selectedNetworks, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filteredNfts.length / pageSize));
  const pageProducts = filteredNfts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleNetwork = (network: string) => {
    setSelectedNetworks((current) =>
      current.includes(network)
        ? current.filter((selected) => selected !== network)
        : [...current, network],
    );
    setCurrentPage(1);
  };

  const selectCategory = (category: string) => {
    setSelectedCategory((current) => (current === category ? null : category));
    setCurrentPage(1);
  };

  return (
    <section
      aria-label="Explorar NFTs"
      className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-start gap-6 px-4 pb-16 font-mono sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-10 lg:px-10"
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
          setPriceRange(draftPriceRange);
          setCurrentPage(1);
        }}
      />
      <ProductCatalog
        products={pageProducts}
        activeTab={activeTab}
        sortOrder={sortOrder}
        currentPage={currentPage}
        pageCount={pageCount}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        onSortChange={setSortOrder}
        onPageChange={setCurrentPage}
      />
    </section>
  );
};

export default Products;
