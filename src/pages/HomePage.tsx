import Header from '../components/Header';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header />
      <main>
        <Hero />
        <FeatureGrid />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
