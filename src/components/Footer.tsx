import React, { useState } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { AppConfig } from '../types';

interface FooterProps {
  config: AppConfig;
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<string | null>(null);

  const primaryPhone = config.primaryContactPhone || '8056702505';
  const secondaryPhone = config.secondaryContactPhone || '7401039450';
  const whatsappNum = config.whatsappNumber || '918056702505';

  const defaultWaUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    'Hello Artisanal Patisserie! I would like to inquire about your custom cakes.'
  )}`;

  const openLegalModal = (title: string, text: string) => {
    setModalTitle(title);
    setModalContent(text);
  };

  return (
    <>
      <footer className="bg-[#f7f3ed] border-t border-[#d4c3c1]/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full flex flex-col gap-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Brand Intro */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#bd9953] text-2xl">cake</span>
                <span className="font-serif text-2xl text-[#321917] font-medium tracking-tight">
                  Artisanal Patisserie
                </span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#504443] max-w-sm leading-relaxed">
                Handcrafted with reverence for classical French confectionery. Bespoke celebration centerpieces, single-origin chocolate tortes, and custom event catering.
              </p>
            </div>

            {/* Boutique Directory */}
            <div className="md:col-span-4 space-y-2">
              <span className="font-sans text-xs font-semibold text-[#321917] uppercase tracking-wider block mb-3">
                Boutique Directory
              </span>
              <ul className="space-y-2.5">
                <li>
                  <a className="text-[#504443] hover:text-[#321917] transition-colors text-xs sm:text-sm font-sans" href="#catalogue">
                    Signature Cakes & Vitrine
                  </a>
                </li>
                <li>
                  <a className="text-[#504443] hover:text-[#321917] transition-colors text-xs sm:text-sm font-sans" href="#custom-cakes">
                    Bespoke Consultations
                  </a>
                </li>
                <li>
                  <a className="text-[#504443] hover:text-[#321917] transition-colors text-xs sm:text-sm font-sans" href="#craftsmanship">
                    Artisanal Ingredients Guide
                  </a>
                </li>
                <li>
                  <a className="text-[#504443] hover:text-[#321917] transition-colors text-xs sm:text-sm font-sans" href="#contact">
                    Visit Our Atelier
                  </a>
                </li>
              </ul>
            </div>

            {/* Direct Atelier Inquiries */}
            <div className="md:col-span-3 space-y-2">
              <span className="font-sans text-xs font-semibold text-[#321917] uppercase tracking-wider block mb-3">
                Direct Atelier Inquiries
              </span>
              <div className="space-y-1 text-xs text-[#504443]">
                <p>
                  Primary: <a href={`tel:${primaryPhone}`} className="text-[#321917] font-semibold hover:underline">+91 {primaryPhone}</a>
                </p>
                <p>
                  Secondary: <a href={`tel:${secondaryPhone}`} className="text-[#321917] font-semibold hover:underline">+91 {secondaryPhone}</a>
                </p>
                <p>WhatsApp: +{whatsappNum}</p>
                <p>442 Rue Saint-Honoré Patisserie Blvd</p>
              </div>

              <a
                className="inline-block mt-2 font-sans text-xs font-semibold text-[#7c5357] hover:text-[#321917] underline"
                href={defaultWaUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Start a Conversation on WhatsApp →
              </a>
            </div>
          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-8 border-t border-[#d4c3c1]/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-[#504443]">
            <p>© 2026 Artisanal Patisserie Boutique. Handcrafted with reverence. All rights reserved.</p>
            <div className="flex flex-wrap gap-6 text-[11px] font-semibold">
              <button
                onClick={() =>
                  openLegalModal(
                    'Privacy Policy',
                    'At Artisanal Patisserie, client confidentiality and personal data protection are paramount. Phone numbers and enquiry details collected through our Custom Cake Enquiry Studio and WhatsApp integrations are solely utilized for coordinating culinary tastings, orders, and delivery schedules. We do not sell or disseminate contact information.'
                  )
                }
                className="hover:text-[#321917] transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() =>
                  openLegalModal(
                    'Terms of Service',
                    'Custom confections and multi-tier celebration cakes require a minimum lead time of 5-7 business days. A non-refundable booking retainer is requested upon date confirmation. Delivery appointments are fulfilled in specialized temperature-controlled vehicles.'
                  )
                }
                className="hover:text-[#321917] transition-colors"
              >
                Terms of Service
              </button>
              <button
                onClick={() =>
                  openLegalModal(
                    'Dietary & Allergen Guide',
                    'Our atelier processes gluten, tree nuts (pistachios, almonds, hazelnuts), dairy, and eggs. While we take meticulous care to prevent cross-contamination and prepare bespoke gluten-free cakes upon request, our kitchen is not a 100% allergen-free facility.'
                  )
                }
                className="hover:text-[#321917] transition-colors"
              >
                Dietary & Allergen Guide
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Dialog Modal */}
      {modalTitle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 border border-[#d4c3c1]/40 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#f1ede7] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#321917]">{modalTitle}</h3>
              <button onClick={() => setModalTitle(null)} className="p-1 rounded-full text-[#827472] hover:text-[#321917]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="font-sans text-xs sm:text-sm text-[#504443] leading-relaxed whitespace-pre-line">
              {modalContent}
            </p>
            <div className="pt-2 text-right">
              <button
                onClick={() => setModalTitle(null)}
                className="px-5 py-2 rounded-full bg-[#4a2e2b] text-white text-xs font-semibold hover:bg-[#321917]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
