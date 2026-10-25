import { useState, type FormEvent } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navbar/Navbar';
import MobileCatalogToolbar from './MobileCatalogToolbar';
import MobileHomeNavbar from './MobileHomeNavbar';
import Products from './products/Products';

const Market = () => {
  const navigate = useNavigate();
  const search = useRouterState({ select: (state) => state.location.search });
  const [query, setQuery] = useState(
    typeof search.q === 'string' ? search.q : '',
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate({
      to: '/market',
      search: (previous) => ({
        ...previous,
        q: query.trim() || undefined,
        page: undefined,
      }),
    });
  };

  return (
    <main className="min-h-screen bg-[#140D0A] pb-24 md:pb-0">
      <div className="hidden md:block">
        <Navbar />
      </div>
      <MobileCatalogToolbar
        query={query}
        filtersOpen={mobileFiltersOpen}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        onFiltersToggle={() => setMobileFiltersOpen((open) => !open)}
      />
      <h1 className="sr-only">Mercado de NFTs</h1>
      <Products
        mobileFiltersOpen={mobileFiltersOpen}
        onMobileFiltersClose={() => setMobileFiltersOpen(false)}
      />
      <Footer />
      <MobileHomeNavbar />
    </main>
  );
};

export default Market;