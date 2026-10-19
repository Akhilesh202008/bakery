import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#fdf9f3]" id="about">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="font-sans text-xs font-semibold text-[#7c5357] uppercase tracking-widest block">
              Our Heritage & Craft
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] lg:leading-[50px] text-[#321917] font-medium tracking-tight">
              Preserving the Soul of Classical Parisian Baking
            </h2>
            <p className="font-sans text-base sm:text-lg text-[#504443] leading-relaxed">
              Founded on the belief that extraordinary cakes are tactile memories in the making, Artisanal Patisserie operates as a boutique confectionery studio rather than a commercial production bakery.
            </p>
            <p className="font-sans text-sm sm:text-base text-[#504443] leading-relaxed">
              Our lead chefs honed their techniques across the storied tearooms of Paris, bringing an uncompromising reverence for balance: rich cocoa contrasted with lively raspberry acidity, velvet buttercreams paired with airy, featherweight sponges, and sculptural poise that commands admiration at every celebration.
            </p>
            <div className="pt-4 flex items-center gap-6 sm:gap-8">
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#321917] font-medium block">12+</span>
                <span className="block font-sans text-xs text-[#504443]">Years of Heritage</span>
              </div>
              <div className="h-10 w-[1px] bg-[#d4c3c1]/40"></div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#321917] font-medium block">4,800+</span>
                <span className="block font-sans text-xs text-[#504443]">Events Celebrated</span>
              </div>
              <div className="h-10 w-[1px] bg-[#d4c3c1]/40"></div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#321917] font-medium block">100%</span>
                <span className="block font-sans text-xs text-[#504443]">Scratch Recipe</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="p-4 bg-[#f7f3ed] rounded-2xl border border-[#d4c3c1]/40 warm-glow">
              <div className="aspect-[16/11] rounded-xl overflow-hidden bg-[#f1ede7]">
                <img
                  alt="Artisanal Patisserie kitchen atelier craftsmanship"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXxI1pQqZT5DL1KHfIjLyIWIK1tTYoz1N10F6a-vZWHjBJthwaG4HeCziWfIajdqaBZoQfMPhAZgwetiHDNgDXH6oobQNhcFtus060X-xo8L-10akK__zWL-7w1h8fsXVhKJid57FZbVXGqYXnnaHcvS4sN3J2STz_pn5LU3TD-1VO4zb_FczHoS_OyohZujq4gzx0N-_EdM_k2hCUuTUUHF28ZxPTNDNG-XdbA3IwW5IlzWBDZ1jDig"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
