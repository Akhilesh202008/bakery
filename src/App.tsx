import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CakeCatalogue } from './components/CakeCatalogue';
import { CustomEnquiryStudio } from './components/CustomEnquiryStudio';
import { Craftsmanship } from './components/Craftsmanship';
import { AboutSection } from './components/AboutSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminDashboard } from './components/AdminDashboard';
import { AppConfig, CakeItem, Inquiry } from './types';

const DEFAULT_CONFIG: AppConfig = {
  primaryContactPhone: '8056702505',
  secondaryContactPhone: '7401039450',
  whatsappNumber: '918056702505',
  flagshipPhoneDisplay: '+1 (555) 019-2834',
  flagshipPhoneDial: '+15550192834',
};

export default function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedCake, setSelectedCake] = useState<CakeItem | null>(null);
  const [inquiryCount, setInquiryCount] = useState<number>(0);
  const [cakes, setCakes] = useState<CakeItem[]>([]);
  const [loadingCakes, setLoadingCakes] = useState(true);

  const fetchCakes = () => {
    setLoadingCakes(true);
    fetch('/api/cakes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.cakes) {
          setCakes(data.cakes);
        }
      })
      .catch((err) => console.error('Failed to load cakes:', err))
      .finally(() => setLoadingCakes(false));
  };

  // Fetch boutique config, cakes, and inquiries count
  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : DEFAULT_CONFIG))
      .then((data) => setConfig((prev) => ({ ...prev, ...data })))
      .catch((err) => console.log('Config fetch fallback:', err));

    fetchCakes();

    fetch('/api/inquiries')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.inquiries) {
          setInquiryCount(data.inquiries.length);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectCakeForEnquiry = (cake: CakeItem) => {
    setSelectedCake(cake);
    const element = document.getElementById('custom-cakes');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInquirySubmitted = (newInquiry: Inquiry) => {
    setInquiryCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#fdf9f3] text-[#1c1c18] font-sans antialiased selection:bg-[#fdc7cb] selection:text-[#321917] flex flex-col">
      {/* Top Navigation */}
      <Header
        config={config}
        onOpenAdmin={() => setIsAdminOpen(true)}
        inquiryCount={inquiryCount}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero config={config} />
        
        <CakeCatalogue
          config={config}
          cakes={cakes}
          loading={loadingCakes}
          onSelectCakeForEnquiry={handleSelectCakeForEnquiry}
          onRefreshCakes={fetchCakes}
        />

        <CustomEnquiryStudio
          config={config}
          preselectedCake={selectedCake}
          onInquirySubmitted={handleInquirySubmitted}
        />

        <Craftsmanship />

        <AboutSection />

        <LocationSection config={config} />
      </main>

      {/* Bottom Footer */}
      <Footer config={config} />

      {/* Persistent Floating WhatsApp Contact Widget */}
      <FloatingWhatsApp config={config} />

      {/* Admin CRM & Cake Management Portal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        config={config}
        onCakesUpdated={fetchCakes}
      />
    </div>
  );
}
