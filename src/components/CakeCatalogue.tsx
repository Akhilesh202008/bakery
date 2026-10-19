import React, { useState } from 'react';
import { MessageCircle, Sparkles, X, Check, AlertCircle, Eye, Info } from 'lucide-react';
import { CakeItem, AppConfig, CakeSizeTier } from '../types';

interface CakeCatalogueProps {
  config: AppConfig;
  cakes: CakeItem[];
  loading?: boolean;
  onSelectCakeForEnquiry: (cake: CakeItem) => void;
  onRefreshCakes?: () => void;
}

export const CakeCatalogue: React.FC<CakeCatalogueProps> = ({
  config,
  cakes,
  loading = false,
  onSelectCakeForEnquiry,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [egglessOnly, setEgglessOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalCake, setModalCake] = useState<CakeItem | null>(null);

  // Modal customization states
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);
  const [selectedFlavour, setSelectedFlavour] = useState<string>('');
  const [customInscription, setCustomInscription] = useState<string>('');

  const whatsappNum = config.whatsappNumber || '918056702505';

  // Categories available
  const baseCategories = [
    { id: 'all', label: 'All Creations' },
    { id: 'chocolate', label: 'Decadent Chocolate' },
    { id: 'classic', label: 'Celebration Classics' },
    { id: 'wedding', label: 'Bridal & Elegance' },
    { id: 'entremets', label: 'French Entremets' },
  ];

  // Also include any custom categories present in database
  const extraCategories = Array.from(
    new Set(
      cakes
        .map((c) => c.category?.toLowerCase())
        .filter((cat) => cat && !['chocolate', 'classic', 'wedding', 'entremets'].includes(cat))
    )
  ).map((cat) => ({
    id: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
  }));

  const allCategories = [...baseCategories, ...extraCategories];

  // Filtering
  const filteredCakes = cakes.filter((cake) => {
    if (egglessOnly && !cake.isEggless) return false;
    if (activeCategory !== 'all' && cake.category?.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = cake.name.toLowerCase().includes(q);
      const matchDesc = cake.description.toLowerCase().includes(q);
      const matchFlavour = cake.flavours?.some((f) => f.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchFlavour) return false;
    }
    return true;
  });

  const getTagBadgeClass = (tagType?: string) => {
    switch (tagType) {
      case 'bestseller':
        return 'bg-[#4a2e2b] text-white';
      case 'signature':
        return 'bg-[#7c5357] text-white';
      case 'consultation':
        return 'bg-[#473200] text-[#bd9953]';
      case 'gift':
        return 'bg-[#e6e2dc] text-[#321917]';
      case 'new':
        return 'bg-[#bd9953] text-[#321917]';
      default:
        return 'bg-[#4a2e2b] text-white';
    }
  };

  const openCakeModal = (cake: CakeItem) => {
    setModalCake(cake);
    setSelectedSizeIndex(0);
    setSelectedFlavour(cake.flavours?.[0] || 'Chef Recommendation');
    setCustomInscription('');
  };

  const getWhatsAppEnquiryUrl = (cake: CakeItem, size?: CakeSizeTier, flavour?: string, inscription?: string) => {
    const sizeText = size ? `${size.size} ($${size.price})` : `Starting at $${cake.startingPrice}`;
    const flavourText = flavour || cake.flavours?.[0] || 'Classic';
    const egglessText = cake.isEggless ? ' [Dietary: 100% Eggless]' : '';

    let text =
      `Bonjour Artisanal Patisserie! 🍰\n` +
      `I am interested in ordering the bespoke cake: "${cake.name}"${egglessText}.\n` +
      `• Tier / Size: ${sizeText}\n` +
      `• Flavour Choice: ${flavourText}\n`;

    if (inscription && inscription.trim()) {
      text += `• Inscription / Notes: "${inscription.trim()}"\n`;
    }

    text += `\nPlease confirm availability and booking consultation.`;
    return `https://wa.me/${whatsappNum}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section className="py-20 bg-[#f7f3ed] border-y border-[#d4c3c1]/20" id="catalogue">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="font-sans text-xs font-semibold text-[#7c5357] uppercase tracking-widest block mb-2">
              Boutique Vitrine
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#321917] tracking-tight font-medium">
              Our Artisanal Collection
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#504443] mt-2 max-w-xl">
              Browse our handcrafted models. Every creation is made to order with 48-hour advance notice to ensure peak aroma and delicate textures.
            </p>
          </div>

          {/* Quick Search */}
          <div className="mt-4 md:mt-0 w-full md:w-64">
            <input
              type="text"
              placeholder="Search flavours, cakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-full px-4 py-2 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
            />
          </div>
        </div>

        {/* Filter Tabs & Eggless Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-10 pb-4 border-b border-[#d4c3c1]/20">
          <div className="flex flex-wrap gap-2" id="filter-tab-bar">
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wider transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-[#4a2e2b] text-white shadow-sm'
                    : 'bg-[#fdf9f3] border border-[#d4c3c1]/40 text-[#504443] hover:border-[#321917]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEgglessOnly(!egglessOnly)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                egglessOnly
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                  : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <span>🌿</span>
              <span>100% Eggless Only</span>
            </button>
          </div>
        </div>

        {/* Catalogue Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl h-96 animate-pulse border border-[#d4c3c1]/30"></div>
            ))}
          </div>
        ) : filteredCakes.length === 0 ? (
          <div className="bg-[#fdf9f3] rounded-2xl p-12 text-center border border-[#d4c3c1]/30 max-w-lg mx-auto">
            <span className="material-symbols-outlined text-4xl text-[#bd9953] mb-2">cake</span>
            <h3 className="font-serif text-xl font-medium text-[#321917]">No Confections Found</h3>
            <p className="font-sans text-xs sm:text-sm text-[#504443] mt-2">
              No cake models match your selected filters. Try clearing your search or switching categories.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setEgglessOnly(false);
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2 rounded-full bg-[#4a2e2b] text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="product-grid">
            {filteredCakes.map((cake) => {
              const isAvailable = cake.isAvailable !== false;
              return (
                <div
                  key={cake.id}
                  className="flex flex-col bg-[#fdf9f3] rounded-xl border border-[#d4c3c1]/30 overflow-hidden soft-card-shadow hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f1ede7]">
                    <img
                      alt={cake.altText || cake.name}
                      className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out ${
                        !isAvailable ? 'grayscale opacity-70' : ''
                      }`}
                      src={cake.imageUrl}
                      loading="lazy"
                    />

                    {/* Tag Badge */}
                    {cake.tag && (
                      <span
                        className={`absolute top-3 left-3 px-3 py-1 rounded-full font-sans text-[11px] font-semibold tracking-wider shadow-sm ${getTagBadgeClass(
                          cake.tagType
                        )}`}
                      >
                        {cake.tag}
                      </span>
                    )}

                    {/* Eggless indicator */}
                    {cake.isEggless && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-700/90 text-white font-sans text-[10px] font-bold shadow-sm backdrop-blur-xs flex items-center gap-1">
                        <span>🌿</span> Eggless
                      </span>
                    )}

                    {/* Unavailable / Sold Out Banner */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-4 py-1.5 rounded-full bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                          Pre-Order Only / Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-serif text-lg sm:text-xl font-medium text-[#321917] leading-snug">
                          {cake.name}
                        </h3>
                      </div>

                      <p className="font-sans text-xs sm:text-sm text-[#504443] mt-2 line-clamp-2 leading-relaxed">
                        {cake.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#d4c3c1]/20 font-sans text-[11px] font-semibold text-[#7c5357]">
                        {cake.sizePriceNote || `From $${cake.startingPrice}`}
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      {isAvailable ? (
                        <a
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#ebe8e2] hover:bg-[#4a2e2b] hover:text-white text-[#321917] border border-[#d4c3c1]/40 font-sans text-xs font-semibold tracking-wider transition-all duration-200"
                          href={getWhatsAppEnquiryUrl(cake)}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current text-[#25D366]" />
                          <span>Enquire on WhatsApp</span>
                        </a>
                      ) : (
                        <a
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#f1ede7] text-[#827472] border border-[#d4c3c1]/40 font-sans text-xs font-medium cursor-pointer hover:bg-[#e6e2dc]"
                          href={getWhatsAppEnquiryUrl(cake)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Request Next Batch Date</span>
                        </a>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          onClick={() => openCakeModal(cake)}
                          className="flex-1 text-center text-[11px] font-medium text-[#321917] hover:text-[#7c5357] hover:underline flex items-center justify-center gap-1 py-1"
                        >
                          <Eye className="w-3 h-3 text-[#7c5357]" />
                          <span>View Details</span>
                        </button>
                        <span className="text-[#d4c3c1]">·</span>
                        <button
                          onClick={() => onSelectCakeForEnquiry(cake)}
                          className="flex-1 text-center text-[11px] font-medium text-[#7c5357] hover:text-[#321917] hover:underline flex items-center justify-center gap-1 py-1"
                        >
                          <Sparkles className="w-3 h-3 text-[#bd9953]" />
                          <span>Inquire Custom</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================
          CAKE PRODUCT DETAIL & CUSTOMIZATION MODAL
          ========================================= */}
      {modalCake && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-[#d4c3c1]/40 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-[#321917] text-white flex items-center justify-between border-b border-[#4a2e2b]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#bd9953] text-xl">cake</span>
                <span className="font-serif text-base font-medium">{modalCake.name}</span>
              </div>
              <button
                onClick={() => setModalCake(null)}
                className="p-1 rounded-full text-[#e7bdb8] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Image */}
                <div className="rounded-xl overflow-hidden aspect-square bg-[#f1ede7] relative border border-[#d4c3c1]/30">
                  <img
                    src={modalCake.imageUrl}
                    alt={modalCake.name}
                    className="w-full h-full object-cover"
                  />
                  {modalCake.isEggless && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-800 text-white font-sans text-xs font-semibold shadow-md flex items-center gap-1">
                      <span>🌿</span> 100% Eggless
                    </span>
                  )}
                  {modalCake.isAvailable === false && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-red-700 text-white text-xs font-bold uppercase">
                        Pre-Order Only
                      </span>
                    </div>
                  )}
                </div>

                {/* Info & Story */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-[#7c5357] uppercase tracking-wider">
                      {modalCake.category} Confectionery
                    </span>
                    <h3 className="font-serif text-2xl font-medium text-[#321917] mt-0.5">
                      {modalCake.name}
                    </h3>
                    <div className="mt-2 text-xl font-bold font-serif text-[#4a2e2b]">
                      ${modalCake.sizes && modalCake.sizes[selectedSizeIndex]
                        ? modalCake.sizes[selectedSizeIndex].price
                        : modalCake.startingPrice}
                    </div>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-[#504443] leading-relaxed">
                    {modalCake.description}
                  </p>

                  {modalCake.dietaryNote && (
                    <div className="p-2.5 bg-[#f7f3ed] rounded-lg border border-[#d4c3c1]/30 text-xs text-[#504443] flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#7c5357] shrink-0" />
                      <span>{modalCake.dietaryNote}</span>
                    </div>
                  )}

                  {modalCake.customizations && (
                    <div className="text-xs text-[#504443]">
                      <strong className="text-[#321917] block mb-0.5">Available Customizations:</strong>
                      <span>{modalCake.customizations}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Size Tiers Selector */}
              {modalCake.sizes && modalCake.sizes.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#f1ede7]">
                  <label className="block font-sans text-xs font-semibold text-[#321917] uppercase tracking-wider">
                    Select Cake Tier / Size:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {modalCake.sizes.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSizeIndex(idx)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          selectedSizeIndex === idx
                            ? 'bg-[#f7f3ed] border-[#4a2e2b] ring-1 ring-[#4a2e2b]'
                            : 'bg-white border-[#d4c3c1]/40 hover:bg-[#fdf9f3]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-[#1c1c18]">{s.size}</div>
                          <div className="text-[11px] text-[#827472]">{s.servings}</div>
                        </div>
                        <div className="font-bold text-[#321917]">${s.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Flavour Options */}
              {modalCake.flavours && modalCake.flavours.length > 0 && (
                <div className="space-y-2">
                  <label className="block font-sans text-xs font-semibold text-[#321917] uppercase tracking-wider">
                    Flavour Profile:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {modalCake.flavours.map((flv, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedFlavour(flv)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selectedFlavour === flv
                            ? 'bg-[#321917] text-white shadow-sm'
                            : 'bg-[#f7f3ed] text-[#504443] border border-[#d4c3c1]/40 hover:bg-[#ebe8e2]'
                        }`}
                      >
                        {flv}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inscription Notes */}
              <div className="space-y-1">
                <label className="block font-sans text-xs font-semibold text-[#321917] uppercase tracking-wider">
                  Personalized Plaque Inscription / Notes:
                </label>
                <input
                  type="text"
                  placeholder='e.g. "Happy 30th Birthday Sophia!" or "Gluten-Free Sponge"'
                  value={customInscription}
                  onChange={(e) => setCustomInscription(e.target.value)}
                  className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-xl px-4 py-2.5 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#fdf9f3] border-t border-[#f1ede7] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#504443]">
                <span>Concierge Numbers: </span>
                <strong className="text-[#321917]">{config.primaryContactPhone}</strong> /{' '}
                <strong className="text-[#321917]">{config.secondaryContactPhone}</strong>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={getWhatsAppEnquiryUrl(
                    modalCake,
                    modalCake.sizes ? modalCake.sizes[selectedSizeIndex] : undefined,
                    selectedFlavour,
                    customInscription
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:opacity-90 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Order on WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    setModalCake(null);
                    onSelectCakeForEnquiry(modalCake);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-[#4a2e2b] text-[#321917] text-xs font-semibold hover:bg-white"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#bd9953]" />
                  <span>Customize in Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
