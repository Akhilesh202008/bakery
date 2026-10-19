import React, { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle2, AlertCircle, Loader2, Sparkles, Phone, Copy, Check } from 'lucide-react';
import { AppConfig, CakeItem, Inquiry } from '../types';

interface CustomEnquiryStudioProps {
  config: AppConfig;
  preselectedCake?: CakeItem | null;
  onInquirySubmitted?: (inquiry: Inquiry) => void;
}

export const CustomEnquiryStudio: React.FC<CustomEnquiryStudioProps> = ({
  config,
  preselectedCake,
  onInquirySubmitted,
}) => {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [occasion, setOccasion] = useState('Wedding Reception');
  const [flavour, setFlavour] = useState('Valrhona 70% Dark Truffle');
  const [guestCount, setGuestCount] = useState('10-15 guests (Single Tier)');
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedInquiry, setSubmittedInquiry] = useState<{
    inquiry: Inquiry;
    clickToChatUrl: string;
    whatsappCloudApiStatus?: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const primaryPhone = config.primaryContactPhone || '8056702505';

  // Minimum date 5 days in advance
  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 5);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minVal = `${yyyy}-${mm}-${dd}`;
    setEventDate(minVal);
  }, []);

  // Update when user clicked "Customize in Studio" from a cake card
  useEffect(() => {
    if (preselectedCake) {
      if (preselectedCake.category === 'wedding') {
        setOccasion('Wedding Reception');
        setGuestCount('60-100+ guests (3 to 4-Tier Masterpiece)');
      } else if (preselectedCake.category === 'chocolate') {
        setFlavour('Valrhona 70% Dark Truffle');
      } else if (preselectedCake.category === 'classic') {
        setFlavour('Madagascar Bourbon Vanilla & Wild Berries');
      }
      setNotes((prev) =>
        prev ? `${prev}\n• Inspired by vitrine: ${preselectedCake.name}` : `• Inspired by vitrine: ${preselectedCake.name}`
      );
    }
  }, [preselectedCake]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clientName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
      setErrorMessage('Please provide a valid phone number for WhatsApp coordination.');
      return;
    }
    if (!eventDate) {
      setErrorMessage('Please select your celebration date.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: clientName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          occasion,
          flavourProfile: flavour,
          guestCount,
          eventDate,
          designNotes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register inquiry.');
      }

      setSubmittedInquiry(data);
      if (onInquirySubmitted && data.inquiry) {
        onInquirySubmitted(data.inquiry);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error submitting your inquiry.');
    } finally {
      setLoading(false);
    }
  };

  const copyRefCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const resetForm = () => {
    setSubmittedInquiry(null);
    setClientName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  return (
    <section className="py-20 bg-[#fdf9f3]" id="custom-cakes">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="font-sans text-xs font-semibold text-[#7c5357] uppercase tracking-widest block mb-2">
              Bespoke Confectionery
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#321917] font-medium tracking-tight">
              Custom Cake Enquiry Studio
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#504443] mt-2 max-w-xl mx-auto">
              Share your celebration vision. Our culinary team will compose a personalized proposal and taste consultation directly on WhatsApp.
            </p>
          </div>

          {/* Interactive Calculator / Form Card */}
          <div className="bg-[#f7f3ed] border border-[#d4c3c1]/40 rounded-2xl p-6 sm:p-10 warm-glow">
            {submittedInquiry ? (
              /* Success Confirmation Card */
              <div className="bg-[#ffffff] rounded-xl p-6 sm:p-8 border border-[#bd9953]/30 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-[#fdf9f3] border-2 border-[#bd9953] flex items-center justify-center mx-auto text-[#7c5357]">
                  <CheckCircle2 className="w-8 h-8 text-[#25D366]" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f7f3ed] border border-[#d4c3c1] mb-2">
                    <span className="text-[11px] font-semibold text-[#504443] uppercase tracking-wider">
                      Reference Code:
                    </span>
                    <span className="font-mono text-xs font-bold text-[#321917]">
                      {submittedInquiry.inquiry.referenceCode}
                    </span>
                    <button
                      onClick={() => copyRefCode(submittedInquiry.inquiry.referenceCode)}
                      className="text-[#7c5357] hover:text-[#321917] p-0.5"
                      title="Copy reference code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <h3 className="font-serif text-2xl font-medium text-[#321917]">
                    Enquiry Registered Successfully
                  </h3>
                  <p className="font-sans text-sm text-[#504443] mt-1 max-w-lg mx-auto">
                    Bonjour <strong className="text-[#321917]">{submittedInquiry.inquiry.clientName}</strong>! Your bespoke cake specification has been stored securely in our atelier registry.
                  </p>
                </div>

                {/* Details Breakdown */}
                <div className="bg-[#fdf9f3] p-5 rounded-xl border border-[#d4c3c1]/30 text-left grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#827472] uppercase tracking-wide block">Occasion:</span>
                    <span className="font-semibold text-[#321917]">{submittedInquiry.inquiry.occasion}</span>
                  </div>
                  <div>
                    <span className="text-[#827472] uppercase tracking-wide block">Celebration Date:</span>
                    <span className="font-semibold text-[#321917]">{submittedInquiry.inquiry.eventDate}</span>
                  </div>
                  <div>
                    <span className="text-[#827472] uppercase tracking-wide block">Flavour Profile:</span>
                    <span className="font-semibold text-[#321917]">{submittedInquiry.inquiry.flavourProfile}</span>
                  </div>
                  <div>
                    <span className="text-[#827472] uppercase tracking-wide block">Guest Count:</span>
                    <span className="font-semibold text-[#321917]">{submittedInquiry.inquiry.guestCount}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#827472] uppercase tracking-wide block">Contact Phone:</span>
                    <span className="font-semibold text-[#321917]">{submittedInquiry.inquiry.phone}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    href={submittedInquiry.clickToChatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#25D366] text-white font-sans text-xs font-semibold tracking-wider uppercase hover:opacity-95 shadow-md active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Open WhatsApp with Reference</span>
                  </a>

                  <a
                    href={`tel:${primaryPhone}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#4a2e2b] text-[#321917] font-sans text-xs font-semibold tracking-wider uppercase hover:bg-[#f7f3ed] transition-all"
                  >
                    <Phone className="w-4 h-4 text-[#7c5357]" />
                    <span>Call Concierge ({primaryPhone})</span>
                  </a>
                </div>

                <div>
                  <button
                    onClick={resetForm}
                    className="text-xs text-[#827472] hover:text-[#321917] underline transition-colors"
                  >
                    Submit Another Custom Enquiry
                  </button>
                </div>
              </div>
            ) : (
              /* Input Form */
              <form className="space-y-6" id="customCakeForm" onSubmit={handleSubmit}>
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block font-sans text-xs font-semibold text-[#504443] uppercase tracking-wider mb-2" htmlFor="clientName">
                      Your Name *
                    </label>
                    <input
                      className="w-full bg-[#ffffff] border border-[#d4c3c1]/40 rounded-full px-5 py-3 text-sm text-[#1c1c18] focus:outline-none focus:border-[#bd9953] focus:ring-1 focus:ring-[#bd9953] transition-all"
                      id="clientName"
                      placeholder="e.g. Eleanor Vance"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                      type="text"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block font-sans text-xs font-semibold text-[#504443] uppercase tracking-wider mb-2" htmlFor="clientPhone">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      className="w-full bg-[#ffffff] border border-[#d4c3c1]/40 rounded-full px-5 py-3 text-sm text-[#1c1c18] focus:outline-none focus:border-[#bd9953] focus:ring-1 focus:ring-[#bd9953] transition-all"
                      id="clientPhone"
                      placeholder="e.g. 8056702505 or +91 8056702505"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      type="tel"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-sans text-xs font-semibold text-[#504443] uppercase tracking-wider mb-2" htmlFor="clientEmail">
                      Email Address (Optional)
                    </label>
                    <input
                      className="w-full bg-[#ffffff] border border-[#d4c3c1]/40 rounded-full px-5 py-3 text-sm text-[#1c1c18] focus:outline-none focus:border-[#bd9953] focus:ring-1 focus:ring-[#bd9953] transition-all"
                      id="clientEmail"
                      placeholder="e.g. eleanor@vance-events.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                    />
                  </div>

                  {/* Occasion */}
                  <div>
                    <label className="block font-sans text-xs font-semibold text-[#504443] uppercase tracking-wider mb-2" htmlFor="occasion">
                      Occasion
                    </label>
                    <select
                      className="w-full bg-[#ffffff] border border-[#d4c3c1]/40 rounded-full px-5 py-3 text-sm text-[#1c1c18] focus:outline-none focus:border-[#bd9953] focus:ring-1 focus:ring-[#bd9953] transition-all"
                      id="occasion"
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                    >
                      <option value="Wedding Reception">Wedding Reception</option>
                      <option value="Birthday Celebration">Birthday Celebration</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Baby Shower">Baby Shower</option>
                      <option value="Corporate Gala">Corporate Gala</option>
                      <option value="Intimate Dinner Party">Intimate Dinner Party</option>
                    </select>
                  </div>

                  {/* Desired Flavour */}
                  <div>
                    <label className="block font-sans text-xs font-semibold text-[#504443] uppercase tracking-wider mb-2" htmlFor="flavour">
                      Desired Flavour Profile
                    </label>
                    <select
                      className="w-full bg-[#ffffff] border border-[#d4c3c1]/40 rounded-full px-5 py-3 text-sm text-[#1c1c18] focus:outline-none focus:border-[#bd9953] focus:ring-1 focus:ring-[#bd9953] transition-all"
                      id="flavour"
                      value={flavour}
                      onChange={(e) => setFlavour(e.target.value)}
                    >
                      <option value="Valrhona 70% Dark Truffle">Valrhona 70% Dark Truffle</option>
                      <option value="Madagascar Bourbon Vanilla & Wild Berries">Madagascar Bourbon Vanilla & Wild Berries</option>
                      <option value="Pistachio Cream & Persian Rosewater">Pistachio Cream & Persian Rosewater</option>
                      <option value="Fleur de Sel Salted Caramel Praline">Fleur de Sel Salted Caramel Praline</option>
                      <option value="Meyer Lemon Curd & French Lavender">Meyer Lemon Curd & French Lavender</option>
                    </select>
                  </div>

                  {/* Guest Count */}
                  <div>
                    <label className="block font-sans text-xs font-semibold text-[#504443] uppercase tracking-wider mb-2" htmlFor="guests">
                      Guest Count / Servings
                    </label>
                    <select
                      className="w-full bg-[#ffffff] border border-[#d4c3c1]/40 rounded-full px-5 py-3 text-sm text-[#1c1c18] focus:outline-none focus:border-[#bd9953] focus:ring-1 focus:ring-[#bd9953] transition-all"
                      id="guests"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                    >
                      <option value="10-15 guests (Single Tier)">10–15 guests (Single Tier)</option>
                      <option value="20-30 guests (2-Tier Compact)">20–30 guests (2-Tier Compact)</option>
                      <option value="35-50 guests (2-Tier Grande)">35–50 guests (2-Tier Grande)</option>
                      <option value="60-100+ guests (3 to 4-Tier Masterpiece)">60–100+ guests (3 to 4-Tier Masterpiece)</option>
                    </select>
                  </div>

                  {/* Date */}
                  <div className="md:col-span-2">
                    <label className="block font-sans text-xs font-semibold text-[#504443] uppercase tracking-wider mb-2" htmlFor="eventDate">
                      Event Date (Minimum 5–7 days notice)
                    </label>
                    <input
                      className="w-full bg-[#ffffff] border border-[#d4c3c1]/40 rounded-full px-5 py-3 text-sm text-[#1c1c18] focus:outline-none focus:border-[#bd9953] focus:ring-1 focus:ring-[#bd9953] transition-all"
                      id="eventDate"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      type="date"
                    />
                  </div>

                  {/* Design Notes */}
                  <div className="md:col-span-2">
                    <label className="block font-sans text-xs font-semibold text-[#504443] uppercase tracking-wider mb-2" htmlFor="notes">
                      Design Vision, Dietary Notes & Inscriptions
                    </label>
                    <textarea
                      className="w-full bg-[#ffffff] border border-[#d4c3c1]/40 rounded-2xl p-4 text-sm text-[#1c1c18] focus:outline-none focus:border-[#bd9953] focus:ring-1 focus:ring-[#bd9953] transition-all"
                      id="notes"
                      placeholder="Specify color theme, fresh floral styling, edible gold leaf, or gluten-free requirements..."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Button & Notice */}
                <div className="pt-4 flex flex-col items-center gap-3">
                  <button
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-[#4a2e2b] text-white font-sans text-xs font-semibold tracking-wider uppercase hover:bg-[#321917] transition-all duration-200 active:scale-95 shadow-md disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Logging Enquiry...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
                        <span>Send Custom Enquiry on WhatsApp</span>
                      </>
                    )}
                  </button>
                  <p className="font-sans text-xs text-[#827472] text-center max-w-lg mt-1 leading-relaxed">
                    Notice: Custom enquiries require a minimum of 5-7 days notice. Submitting an enquiry does not finalize an order or charge payment until our pastry chefs confirm availability and schedule your consultation.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
