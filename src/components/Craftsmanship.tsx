import React from 'react';

export const Craftsmanship: React.FC = () => {
  return (
    <section className="py-20 bg-[#f7f3ed] border-y border-[#d4c3c1]/20" id="craftsmanship">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-sans text-xs font-semibold text-[#7c5357] uppercase tracking-widest block mb-2">
            The Patisserie Standard
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#321917] font-medium tracking-tight">
            Why Customers Choose Our Atelier
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#504443] mt-2">
            Every creation is prepared according to strict classical French culinary protocols with zero compromises on provenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Pillar 1 */}
          <div className="bg-[#fdf9f3] p-8 rounded-2xl border border-[#d4c3c1]/30 soft-card-shadow flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-[#fdc7cb]/40 flex items-center justify-center text-[#321917] mb-6">
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </div>
            <h3 className="font-serif text-xl font-medium text-[#321917] mb-3">Fresh Daily Baking</h3>
            <p className="font-sans text-xs sm:text-sm text-[#504443] leading-relaxed">
              Every sponge, praline crunch, and pastry cream is baked and assembled from scratch within hours of delivery. Never frozen, preserving immaculate moisture and delicate crumb.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#fdf9f3] p-8 rounded-2xl border border-[#d4c3c1]/30 soft-card-shadow flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-[#ffdea5]/40 flex items-center justify-center text-[#473200] mb-6">
              <span className="material-symbols-outlined text-2xl">eco</span>
            </div>
            <h3 className="font-serif text-xl font-medium text-[#321917] mb-3">Pure Origin Ingredients</h3>
            <p className="font-sans text-xs sm:text-sm text-[#504443] leading-relaxed">
              We exclusively use 70% Valrhona single-origin chocolates, cultured Normandy butter, whole Madagascar Bourbon vanilla pods, and seasonal organic berries.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#fdf9f3] p-8 rounded-2xl border border-[#d4c3c1]/30 soft-card-shadow flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-[#fdc7cb]/40 flex items-center justify-center text-[#321917] mb-6">
              <span className="material-symbols-outlined text-2xl">palette</span>
            </div>
            <h3 className="font-serif text-xl font-medium text-[#321917] mb-3">Bespoke Artistry</h3>
            <p className="font-sans text-xs sm:text-sm text-[#504443] leading-relaxed">
              Every delicate sugar bloom, spun caramel veil, and gold leaf fleck is applied individually by master pâtissiers trained in classical French haute patisserie.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-[#fdf9f3] p-8 rounded-2xl border border-[#d4c3c1]/30 soft-card-shadow flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-[#ffdea5]/40 flex items-center justify-center text-[#473200] mb-6">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <h3 className="font-serif text-xl font-medium text-[#321917] mb-3">White-Glove Delivery</h3>
            <p className="font-sans text-xs sm:text-sm text-[#504443] leading-relaxed">
              Delivered personally in specialized climate-stabilized bakery vehicles directly to your venue, ensuring zero structural compromise or temperature fatigue.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
