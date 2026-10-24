import Navbar from '@/components/navbar/Navbar';
import Hero from './Hero';
import Products from './products/Products';
import FeaturedBanners from '@/components/featuredBanners/FeaturedBanners';
import BlogSection from '@/components/blogSection/BlogSection';
import Footer from '@/components/footer/Footer';

const Home = () => {
  return (
    <main id="home_section" className="min-h-screen bg-[#140D0A]">
      <Navbar />
      <Hero />
      <Products />
      <FeaturedBanners />
      <BlogSection />
      <Footer />
    </main>
  );
};

export default Home;