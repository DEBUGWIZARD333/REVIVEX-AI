import HeroBanner from '../components/HeroBanner';
import CategorySection from '../components/CategorySection';
import FeaturedProducts from '../components/FeaturedProducts';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow">
        <HeroBanner />
        <CategorySection />
        <FeaturedProducts />
      </main>
    </div>
  );
};

export default Home;
