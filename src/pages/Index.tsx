import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/Footer';
import HeroSection from '@/sections/HeroSection';
import FeaturesSection from '@/sections/FeaturesSection';
import DomainsSection from '@/sections/DomainsSection';
import CTASection from '@/sections/CTASection';

const Index = () => {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <main>
        <HeroSection />
        <FeaturesSection />
        <DomainsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
