// src/pages/HomePage.tsx
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Pricing from '../components/Pricing';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="bg-[#0A0A0A] text-slate-200 font-sans antialiased overflow-x-hidden">
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <Pricing />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;

