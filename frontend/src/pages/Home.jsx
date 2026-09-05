import HeroBanner from '../components/HeroBanner';
import CategorySection from '../components/CategorySection';
import FeaturedProducts from '../components/FeaturedProducts';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-surface-dark)', color: '#fff' }}>
      <main className="flex-grow">
        <HeroBanner />
        <CategorySection />
        <FeaturedProducts />
      </main>
    </div>
  );
};

export default Home;
