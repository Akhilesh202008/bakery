import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Copy, Check, ExternalLink } from 'lucide-react';
import { AppConfig } from '../types';

interface LocationSectionProps {
  config: AppConfig;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const primaryPhone = config.primaryContactPhone || '8056702505';
  const secondaryPhone = config.secondaryContactPhone || '7401039450';
  const whatsappNum = config.whatsappNumber || '918056702505';

  const address = '442 Rue Saint-Honoré Patisserie Blvd, Suite 100, West End';

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section className="py-20 bg-[#f7f3ed] border-t border-[#d4c3c1]/20" id="contact">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-sans text-xs font-semibold text-[#7c5357] uppercase tracking-widest block mb-2">
            Visit & Connect
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#321917] font-medium tracking-tight">
            Atelier & Boutique Location
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#504443] mt-2">
            Step into our storefront for morning pastries or coordinate directly with our pastry chefs via WhatsApp for custom commissions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details (5 cols) */}
          <div className="lg:col-span-5 bg-[#fdf9f3] p-6 sm:p-8 rounded-2xl border border-[#d4c3c1]/30 soft-card-shadow space-y-6">
            <div>
              <span className="font-sans text-[11px] font-semibold text-[#7c5357] uppercase tracking-wider block">
                Boutique Flagship
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#321917] mt-1">
                Artisanal Patisserie Atelier & Boutique
              </h3>
            </div>

            {/* Address Card with Copy Action */}
            <div className="p-4 bg-[#f7f3ed] rounded-xl border border-[#d4c3c1]/30 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#321917] mt-0.5 shrink-0" />
                <div>
                  <span className="font-sans text-[11px] font-semibold text-[#504443] uppercase tracking-wider block">
                    Address
                  </span>
                  <p className="font-sans text-sm font-medium text-[#1c1c18] mt-0.5" id="fullAddressText">
                    {address}
                  </p>
                </div>
              </div>
              <button
                className="p-2 rounded-full hover:bg-white border border-[#d4c3c1]/30 text-[#504443] hover:text-[#321917] transition-colors"
                onClick={handleCopy}
                title="Copy Address"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Customer Inquiry Numbers & Direct WhatsApp Links */}
            <div className="space-y-4 font-sans text-sm">
              {/* Primary Contact Number */}
              <div className="flex items-center gap-3 text-[#1c1c18]">
                <div className="w-8 h-8 rounded-full bg-[#f1ede7] flex items-center justify-center text-[#7c5357] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#827472] uppercase block">Primary Order Phone</span>
                  <a className="font-bold text-[#321917] hover:underline text-base" href={`tel:${primaryPhone}`}>
                    +91 {primaryPhone}
                  </a>
                </div>
              </div>

              {/* Secondary Contact Number */}
              <div className="flex items-center gap-3 text-[#1c1c18]">
                <div className="w-8 h-8 rounded-full bg-[#f1ede7] flex items-center justify-center text-[#bd9953] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#827472] uppercase block">Secondary Inquiry Line</span>
                  <a className="font-bold text-[#321917] hover:underline text-base" href={`tel:${secondaryPhone}`}>
                    +91 {secondaryPhone}
                  </a>
                </div>
              </div>

              {/* WhatsApp Direct */}
              <div className="flex items-center gap-3 text-[#1c1c18]">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-[#25D366] shrink-0">
                  <MessageCircle className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#827472] uppercase block">WhatsApp Business</span>
                  <a
                    className="font-semibold text-[#321917] hover:underline flex items-center gap-1.5"
                    href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent('Hello Chef! I am contacting you regarding an inquiry for Artisanal Patisserie.')}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>Chat with Chef (+{whatsappNum})</span>
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 text-[#1c1c18]">
                <div className="w-8 h-8 rounded-full bg-[#f1ede7] flex items-center justify-center text-[#7c5357] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#827472] uppercase block">Boutique Concierge</span>
                  <a className="text-[#504443] hover:text-[#321917] hover:underline" href="mailto:atelier@artisanalpatisserie.com">
                    atelier@artisanalpatisserie.com
                  </a>
                </div>
              </div>
            </div>

            {/* Atelier Opening Hours */}
            <div className="pt-4 border-t border-[#d4c3c1]/20">
              <span className="font-sans text-xs font-semibold text-[#321917] uppercase tracking-wider block mb-3">
                Atelier Opening Hours
              </span>
              <div className="space-y-2 font-sans text-xs text-[#504443]">
                <div className="flex justify-between py-1 border-b border-[#d4c3c1]/10">
                  <span className="font-medium text-[#1c1c18]">Tuesday – Saturday</span>
                  <span>8:00 AM – 7:30 PM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#d4c3c1]/10">
                  <span className="font-medium text-[#1c1c18]">Sunday</span>
                  <span>9:00 AM – 4:00 PM</span>
                </div>
                <div className="flex justify-between py-1 text-[#7c5357] font-semibold">
                  <span>Monday</span>
                  <span>Closed (Private Event Baking)</span>
                </div>
              </div>
            </div>

            {/* Configuration Notice Badge */}
            <div className="p-3.5 bg-[#fdc7cb]/30 rounded-xl border border-[#fdc7cb] text-xs text-[#301216] leading-relaxed">
              <span className="font-bold">Business WhatsApp Integration:</span> Connected to official Meta Cloud API & Click-to-Chat routing for <strong className="font-mono">+{whatsappNum}</strong>.
            </div>
          </div>

          {/* Visual Map Frame (7 cols) */}
          <div className="lg:col-span-7 bg-[#fdf9f3] p-4 rounded-2xl border border-[#d4c3c1]/30 soft-card-shadow flex flex-col h-full min-h-[460px]">
            <div className="relative w-full flex-1 rounded-xl overflow-hidden bg-[#ebe8e2] flex flex-col justify-between p-6">
              {/* Map Decor Background & Pin */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#4a2e2b_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-full bg-white text-[#321917] font-sans text-xs font-semibold border border-[#d4c3c1]/40 shadow-sm">
                  Patisserie District · West End
                </span>
                <a
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#4a2e2b] text-white font-sans text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
                  href="https://maps.google.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Map Pin Center */}
              <div className="relative z-10 self-center text-center my-auto py-8">
                <div className="inline-flex p-4 rounded-full bg-white shadow-lg border border-[#d4c3c1]/30 mb-3 transform animate-bounce">
                  <span className="material-symbols-outlined text-[#321917] text-3xl">storefront</span>
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-medium text-[#321917]">
                  Artisanal Patisserie Boutique
                </h4>
                <p className="font-sans text-xs sm:text-sm text-[#504443] mt-1">
                  442 Rue Saint-Honoré Patisserie Blvd
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-[#7c5357]">
                  <span>Customer Support:</span>
                  <span className="font-mono text-[#321917]">{primaryPhone}</span>
                  <span>/</span>
                  <span className="font-mono text-[#321917]">{secondaryPhone}</span>
                </div>
              </div>

              <div className="relative z-10 p-3 bg-[#fdf9f3]/90 backdrop-blur-md rounded-xl border border-[#d4c3c1]/30 font-sans text-xs text-[#504443] text-center">
                Valet parking available for cake collection appointments along the west promenade.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
