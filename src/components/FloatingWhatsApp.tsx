import React, { useState } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { AppConfig } from '../types';

interface FloatingWhatsAppProps {
  config: AppConfig;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ config }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryPhone = config.primaryContactPhone || '8056702505';
  const secondaryPhone = config.secondaryContactPhone || '7401039450';
  const whatsappNum = config.whatsappNumber || '918056702505';

  const defaultWaUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    'Hello Artisanal Patisserie! I have a question about ordering a cake.'
  )}`;

  const secondaryWaUrl = `https://wa.me/91${secondaryPhone}?text=${encodeURIComponent(
    'Hello Artisanal Patisserie! I would like to make an inquiry via your secondary line.'
  )}`;

  return (
    <aside aria-label="WhatsApp Quick Contact" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Expanded Quick Contact Popover */}
      {menuOpen && (
        <div className="w-72 bg-white rounded-2xl p-4 border border-[#d4c3c1]/40 shadow-xl mb-1 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[#f1ede7]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-serif text-sm font-semibold text-[#321917]">Patisserie Concierge</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-[#827472] hover:text-[#321917] p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="font-sans text-xs text-[#504443] leading-relaxed">
            Chat directly with our master pastry chefs on WhatsApp for quick pricing, cake availability, and custom designs.
          </p>

          <div className="space-y-2 pt-1">
            <a
              href={defaultWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#1c1c18] text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-current" />
                <span>Primary Desk</span>
              </div>
              <span className="font-mono text-[11px] text-[#504443]">{primaryPhone}</span>
            </a>

            <a
              href={secondaryWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#f7f3ed] hover:bg-[#ebe8e2] border border-[#d4c3c1]/40 text-[#1c1c18] text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#7c5357]" />
                <span>Secondary Line</span>
              </div>
              <span className="font-mono text-[11px] text-[#504443]">{secondaryPhone}</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-3">
        {!menuOpen && (
          <div className="hidden md:block bg-white px-3.5 py-1.5 rounded-full border border-[#d4c3c1]/40 shadow-md font-sans text-xs font-semibold text-[#321917]">
            Chat with us on WhatsApp
          </div>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Direct WhatsApp Chat with Artisanal Patisserie"
          className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
        >
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c4.55 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.19 8.19 0 0 1-5.82 2.41h-.01c-1.46 0-2.9-.39-4.16-1.14l-.3-.18-3.1 0.81 0.83-3.02-.19-.31a8.21 8.21 0 0 1-1.26-4.4c0-4.55 3.7-8.24 8.24-8.24zm4.52 11.58c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8 2.52 1.09 2.52.73 2.98.69.45-.04 1.47-.6 1.68-1.18.21-.59.21-1.09.15-1.19-.06-.1-.23-.17-.48-.29z"></path>
          </svg>
        </button>
      </div>
    </aside>
  );
};
