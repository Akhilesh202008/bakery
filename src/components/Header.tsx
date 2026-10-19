import React, { useState } from 'react';
import { Phone, MessageCircle, Menu, X, ShieldCheck, ChevronDown } from 'lucide-react';
import { AppConfig } from '../types';

interface HeaderProps {
  config: AppConfig;
  onOpenAdmin: () => void;
  inquiryCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ config, onOpenAdmin, inquiryCount = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [phoneMenuOpen, setPhoneMenuOpen] = useState(false);

  const primaryPhone = config.primaryContactPhone || '8056702505';
  const secondaryPhone = config.secondaryContactPhone || '7401039450';
  const whatsappNum = config.whatsappNumber || '918056702505';

  const defaultWaUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    'Hello Artisanal Patisserie! I would like to place an order or inquire about your bespoke confections.'
  )}`;

  return (
    <header className="sticky top-0 z-50 bg-[#fdf9f3]/95 backdrop-blur-md shadow-sm border-b border-[#d4c3c1]/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20 w-full">
        {/* Brand Logo Anchor */}
        <a className="flex items-center gap-2 group" href="#hero">
          <span className="material-symbols-outlined text-[#bd9953] text-2xl group-hover:rotate-12 transition-transform duration-300">
            cake
          </span>
          <span className="font-serif text-xl sm:text-2xl text-[#321917] tracking-tight font-medium">
            Artisanal Patisserie
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-7">
          <a className="text-[#321917] font-semibold border-b-2 border-[#321917] pb-1 text-xs tracking-wider uppercase font-sans" href="#hero">
            Home
          </a>
          <a className="text-[#504443] text-xs tracking-wider uppercase font-sans hover:text-[#321917] transition-colors" href="#catalogue">
            Our Cakes
          </a>
          <a className="text-[#504443] text-xs tracking-wider uppercase font-sans hover:text-[#321917] transition-colors" href="#custom-cakes">
            Custom Cakes
          </a>
          <a className="text-[#504443] text-xs tracking-wider uppercase font-sans hover:text-[#321917] transition-colors" href="#craftsmanship">
            Why Us
          </a>
          <a className="text-[#504443] text-xs tracking-wider uppercase font-sans hover:text-[#321917] transition-colors" href="#about">
            About
          </a>
          <a className="text-[#504443] text-xs tracking-wider uppercase font-sans hover:text-[#321917] transition-colors" href="#contact">
            Contact
          </a>
        </nav>

        {/* Trailing Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Phone Selector with Primary: 8056702505 & Secondary: 7401039450 */}
          <div className="relative">
            <button
              onClick={() => setPhoneMenuOpen(!phoneMenuOpen)}
              className="hidden sm:inline-flex items-center gap-1.5 text-[#504443] hover:text-[#321917] text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full hover:bg-[#f1ede7] transition-colors"
              title="Customer Inquiry Phone Numbers"
            >
              <Phone className="w-3.5 h-3.5 text-[#bd9953]" />
              <span>{primaryPhone}</span>
              <ChevronDown className="w-3 h-3 text-[#827472]" />
            </button>

            {phoneMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#d4c3c1]/40 rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[10px] tracking-wider uppercase text-[#827472] px-3 py-1 font-semibold">
                  Customer Inquiry Lines
                </div>
                <a
                  href={`tel:${primaryPhone}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#f7f3ed] text-[#321917] text-xs font-medium"
                  onClick={() => setPhoneMenuOpen(false)}
                >
                  <Phone className="w-3.5 h-3.5 text-[#7c5357]" />
                  <div>
                    <div className="font-semibold">{primaryPhone}</div>
                    <div className="text-[10px] text-[#827472]">Primary Order Desk</div>
                  </div>
                </a>
                <a
                  href={`tel:${secondaryPhone}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#f7f3ed] text-[#321917] text-xs font-medium"
                  onClick={() => setPhoneMenuOpen(false)}
                >
                  <Phone className="w-3.5 h-3.5 text-[#bd9953]" />
                  <div>
                    <div className="font-semibold">{secondaryPhone}</div>
                    <div className="text-[10px] text-[#827472]">Secondary Concierge</div>
                  </div>
                </a>
                <div className="border-t border-[#f1ede7] my-1"></div>
                <a
                  href="tel:+15550192834"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-[#f7f3ed] text-[#504443] text-[11px]"
                  onClick={() => setPhoneMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-sm text-[#827472]">storefront</span>
                  <span>+1 (555) 019-2834 (Flagship)</span>
                </a>
              </div>
            )}
          </div>

          {/* WhatsApp Direct Order Button */}
          <a
            className="inline-flex items-center gap-2 bg-[#4a2e2b] text-white hover:bg-[#321917] active:scale-95 transition-all duration-200 rounded-full px-4 sm:px-5 py-2.5 text-xs font-semibold tracking-wider shadow-sm"
            href={defaultWaUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
            <span className="hidden xs:inline">Order on WhatsApp</span>
            <span className="xs:hidden">WhatsApp</span>
          </a>

          {/* Admin Dashboard Trigger */}
          <button
            onClick={onOpenAdmin}
            className="relative p-2 rounded-full text-[#504443] hover:text-[#321917] hover:bg-[#f1ede7] transition-colors border border-[#d4c3c1]/40"
            title="Atelier Admin Portal & CRM"
          >
            <ShieldCheck className="w-4 h-4 text-[#7c5357]" />
            {inquiryCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ba1a1a] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {inquiryCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#321917] hover:bg-[#f1ede7]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fdf9f3] border-b border-[#d4c3c1]/40 px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3 font-sans text-sm">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#321917] font-semibold py-1 border-b border-[#f1ede7]"
            >
              Home
            </a>
            <a
              href="#catalogue"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#504443] hover:text-[#321917] py-1 border-b border-[#f1ede7]"
            >
              Our Cakes
            </a>
            <a
              href="#custom-cakes"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#504443] hover:text-[#321917] py-1 border-b border-[#f1ede7]"
            >
              Custom Cakes
            </a>
            <a
              href="#craftsmanship"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#504443] hover:text-[#321917] py-1 border-b border-[#f1ede7]"
            >
              Why Us
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#504443] hover:text-[#321917] py-1 border-b border-[#f1ede7]"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#504443] hover:text-[#321917] py-1"
            >
              Contact & Location
            </a>
          </nav>

          <div className="pt-3 border-t border-[#d4c3c1]/30 flex flex-col gap-2">
            <div className="text-xs text-[#827472] font-semibold uppercase">Direct Inquiry Numbers:</div>
            <div className="flex flex-wrap gap-3">
              <a href={`tel:${primaryPhone}`} className="inline-flex items-center gap-1.5 text-xs text-[#321917] font-bold">
                <Phone className="w-3.5 h-3.5 text-[#7c5357]" /> {primaryPhone}
              </a>
              <span className="text-[#d4c3c1]">·</span>
              <a href={`tel:${secondaryPhone}`} className="inline-flex items-center gap-1.5 text-xs text-[#321917] font-bold">
                <Phone className="w-3.5 h-3.5 text-[#bd9953]" /> {secondaryPhone}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
