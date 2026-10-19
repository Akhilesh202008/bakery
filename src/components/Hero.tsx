import React from 'react';
import { MessageCircle } from 'lucide-react';
import { AppConfig } from '../types';

interface HeroProps {
  config: AppConfig;
}

export const Hero: React.FC<HeroProps> = ({ config }) => {
  const whatsappNum = config.whatsappNumber || '918056702505';
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    "Hello Artisanal Patisserie! I'd like to inquire about your fresh cakes and bespoke event confections."
  )}`;

  return (
    <section className="relative pt-8 pb-16 lg:py-20 overflow-hidden" id="hero">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Narrative (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#fdc7cb]/50 border border-[#d4c3c1]/40">
              <span className="w-2 h-2 rounded-full bg-[#7c5357] animate-pulse"></span>
              <span className="font-sans text-[11px] font-semibold tracking-wider text-[#301216] uppercase">
                Atelier & Boutique · Paris Inspired
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] lg:leading-[68px] text-[#321917] tracking-tight font-medium">
              Every Celebration Deserves <span className="italic font-normal text-[#7c5357]">Something Sweet</span>
            </h1>

            <p className="font-sans text-base sm:text-lg text-[#504443] max-w-xl leading-relaxed">
              Handcrafted bespoke celebration cakes, velvety multilayered tortes, and French entremets baked daily using single-origin Valrhona chocolate, farm-fresh fruit, and French cream.
            </p>

            {/* Dual Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                className="inline-flex items-center justify-center rounded-full bg-[#4a2e2b] text-white px-7 py-3.5 text-xs font-semibold tracking-wider uppercase hover:bg-[#321917] transition-all duration-200 soft-card-shadow active:scale-95"
                href="#catalogue"
              >
                Explore Our Cakes
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-full border border-[#4a2e2b] text-[#321917] px-7 py-3.5 text-xs font-semibold tracking-wider uppercase hover:bg-[#fdc7cb]/40 transition-all duration-200 active:scale-95"
                href={whatsappUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
                Order on WhatsApp
              </a>
            </div>

            {/* Trust Highlights Bar */}
            <div className="pt-6 border-t border-[#d4c3c1]/30 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[#504443] font-sans text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[#bd9953]">✦</span>
                <span className="font-medium">Scratch-Baked Daily</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#bd9953]">✦</span>
                <span className="font-medium">Madagascar Vanilla</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#bd9953]">✦</span>
                <span className="font-medium">Bespoke Event Styling</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#bd9953]">✦</span>
                <span className="font-medium">Chilled Hand-Delivery</span>
              </div>
            </div>
          </div>

          {/* Hero Image Vitrine (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl p-3 bg-[#f7f3ed] border border-[#d4c3c1]/30 warm-glow">
              <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-[#f1ede7]">
                <img
                  alt="Royal Rose & Raspberry 3-Tier bespoke artisanal celebration cake"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXxI1pQqZT5DL1KHfIjLyIWIK1tTYoz1N10F6a-vZWHjBJthwaG4HeCziWfIajdqaBZoQfMPhAZgwetiHDNgDXH6oobQNhcFtus060X-xo8L-10akK__zWL-7w1h8fsXVhKJid57FZbVXGqYXnnaHcvS4sN3J2STz_pn5LU3TD-1VO4zb_FczHoS_OyohZujq4gzx0N-_EdM_k2hCUuTUUHF28ZxPTNDNG-XdbA3IwW5IlzWBDZ1jDig"
                />
                {/* Floating Tasting Ribbon Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#fdf9f3]/90 backdrop-blur-md px-4 py-3 rounded-xl border border-[#d4c3c1]/30 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="block font-sans text-[11px] font-semibold text-[#7c5357] uppercase tracking-wider">
                      Chef's Centerpiece
                    </span>
                    <span className="font-serif text-base sm:text-lg font-medium text-[#321917]">
                      Royal Rose & Raspberry 3-Tier
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[#bd9953]">
                    verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
