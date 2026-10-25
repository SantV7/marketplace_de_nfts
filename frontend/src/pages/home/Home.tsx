import { useState, type FormEvent } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import Navbar from '@/components/navbar/Navbar';
import Hero from './Hero';
import Products from './products/Products';
import FeaturedBanners from '@/components/featuredBanners/FeaturedBanners';
import BlogSection from '@/components/blogSection/BlogSection';
import Footer from '@/components/footer/Footer';
import MobileHomeNavbar from './MobileHomeNavbar';
import MobileCatalogToolbar from './MobileCatalogToolbar';

const Home = () => {
  const navigate = useNavigate();
  const search = useRouterState({ select: (state) => state.location.search });
  const [query, setQuery] = useState(
    typeof search.q === 'string' ? search.q : '',
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate({
      to: '/',
      search: (previous) => ({
        ...previous,
        q: query.trim() || undefined,
        page: undefined,
      }),
    });
  };

  return (
    <main id="home_section" className="min-h-screen bg-[#140D0A] pb-24 md:pb-0">
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
      <Hero />
      <Products
        mobileFiltersOpen={mobileFiltersOpen}
        onMobileFiltersClose={() => setMobileFiltersOpen(false)}
      />
      <FeaturedBanners />
      <BlogSection />
      <Footer />
      <MobileHomeNavbar />
    </main>
  );
};

export default Home;