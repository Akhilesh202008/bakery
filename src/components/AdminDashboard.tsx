import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Filter,
  CheckCircle,
  Clock,
  MessageCircle,
  Database,
  Trash2,
  Edit,
  Send,
  RefreshCw,
  AlertCircle,
  Phone,
  Calendar,
  Layers,
  DollarSign,
  Plus,
  Upload,
  Image as ImageIcon,
  Eye,
  Check,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Inquiry, InquiryStatus, MessageLog, AppConfig, CakeItem, CakeSizeTier } from '../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onCakesUpdated?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  config,
  onCakesUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'cakes' | 'inquiries' | 'whatsapp' | 'database'>('cakes');

  // Cakes State
  const [cakes, setCakes] = useState<CakeItem[]>([]);
  const [cakeSearch, setCakeSearch] = useState('');
  const [cakeCategoryFilter, setCakeCategoryFilter] = useState('ALL');
  const [loadingCakes, setLoadingCakes] = useState(false);

  // Add / Edit Cake Modal State
  const [isCakeModalOpen, setIsCakeModalOpen] = useState(false);
  const [editingCakeId, setEditingCakeId] = useState<string | null>(null);
  const [cakeFormName, setCakeFormName] = useState('');
  const [cakeFormCategory, setCakeFormCategory] = useState('classic');
  const [cakeFormDescription, setCakeFormDescription] = useState('');
  const [cakeFormStartingPrice, setCakeFormStartingPrice] = useState('65');
  const [cakeFormSizeNote, setCakeFormSizeNote] = useState('');
  const [cakeFormTag, setCakeFormTag] = useState('New Arrival');
  const [cakeFormTagType, setCakeFormTagType] = useState<'bestseller' | 'signature' | 'consultation' | 'gift' | 'new'>('new');
  const [cakeFormImageUrl, setCakeFormImageUrl] = useState('');
  const [cakeFormFlavours, setCakeFormFlavours] = useState('Madagascar Vanilla, Dark Cocoa, Salted Caramel');
  const [cakeFormIsEggless, setCakeFormIsEggless] = useState(false);
  const [cakeFormDietaryNote, setCakeFormDietaryNote] = useState('Contains Eggs');
  const [cakeFormIsAvailable, setCakeFormIsAvailable] = useState(true);
  const [cakeFormIsFeatured, setCakeFormIsFeatured] = useState(false);
  const [cakeFormLeadTime, setCakeFormLeadTime] = useState('48');
  const [cakeFormCustomizations, setCakeFormCustomizations] = useState('');
  const [cakeFormSizes, setCakeFormSizes] = useState<CakeSizeTier[]>([
    { size: '6-inch Round', servings: '8-10 guests', price: 65 },
    { size: '8-inch Round', servings: '14-16 guests', price: 88 },
  ]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [cakeSaving, setCakeSaving] = useState(false);
  const [cakeFormError, setCakeFormError] = useState<string | null>(null);

  // Inquiries State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Inquiry for Modal / Edit
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [editStatus, setEditStatus] = useState<InquiryStatus>('NEW');
  const [internalNotes, setInternalNotes] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<string>('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Health and engine info
  const [dbInfo, setDbInfo] = useState<any>(null);

  // Simulated Webhook message sender
  const [simPhone, setSimPhone] = useState('918056702505');
  const [simText, setSimText] = useState('Bonjour! I would like to inquire about wedding cake tasting sessions.');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchCakes = async () => {
    setLoadingCakes(true);
    try {
      const res = await fetch('/api/cakes');
      const data = await res.json();
      if (data.cakes) {
        setCakes(data.cakes);
      }
    } catch (err) {
      console.error('Failed to load cakes:', err);
    } finally {
      setLoadingCakes(false);
    }
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inquiries?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.inquiries) {
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/whatsapp/logs');
      const data = await res.json();
      if (data.logs) {
        setMessageLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setDbInfo(data);
    } catch (err) {
      console.error('Failed to fetch health:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCakes();
      fetchInquiries();
      fetchLogs();
      fetchHealth();
    }
  }, [isOpen, statusFilter, search]);

  useEffect(() => {
    if (selectedInquiry) {
      setEditStatus(selectedInquiry.status);
      setInternalNotes(selectedInquiry.internalNotes || '');
      setEstimatedPrice(selectedInquiry.estimatedPrice ? String(selectedInquiry.estimatedPrice) : '');
      setReplyMessage(
        `Bonjour ${selectedInquiry.clientName}! This is Artisanal Patisserie regarding your custom cake enquiry [${selectedInquiry.referenceCode}] for ${selectedInquiry.eventDate}. We have reviewed your vision and are pleased to provide your quote.`
      );
    }
  }, [selectedInquiry]);

  if (!isOpen) return null;

  // ==========================================
  // CAKE MODEL HANDLERS
  // ==========================================

  const openAddCakeModal = () => {
    setEditingCakeId(null);
    setCakeFormName('');
    setCakeFormCategory('classic');
    setCakeFormDescription('');
    setCakeFormStartingPrice('68');
    setCakeFormSizeNote('Sizes: 6-inch | 8-inch · From $68');
    setCakeFormTag('New Arrival');
    setCakeFormTagType('new');
    setCakeFormImageUrl('https://lh3.googleusercontent.com/aida-public/AB6AXuAVwjGBik0CytnEyWI4BjlyIapeQH_qjwR1XrjPUCSRsbypkWnrxRzdRSYJrEWIzc_c8tWgQ8wc2FFpfL4wQtuJXNeLHhyVdkW5q3CGze26-X9pI6PnJ82WJe4cYAAJJsTCYZtWzYUTJTbPbAQOhgsotBmfEbp8hQJ2QGW6ZZQjiuo8KCI7Z_oH2LrmskfZRC8PJ0mioDaj6y3YihaDrzGSqfBPBb_uCkRvkuryMwQrTEODYigfIGfKpg');
    setCakeFormFlavours('French Chocolate, Hazelnut Ganache, Fleur de Sel');
    setCakeFormIsEggless(false);
    setCakeFormDietaryNote('Contains Eggs');
    setCakeFormIsAvailable(true);
    setCakeFormIsFeatured(false);
    setCakeFormLeadTime('48');
    setCakeFormCustomizations('Personalized edible gold plaque, seasonal floral styling');
    setCakeFormSizes([
      { size: '6-inch Round', servings: '8-10 guests', price: 68 },
      { size: '8-inch Round', servings: '14-16 guests', price: 92 },
    ]);
    setCakeFormError(null);
    setIsCakeModalOpen(true);
  };

  const openEditCakeModal = (cake: CakeItem) => {
    setEditingCakeId(cake.id);
    setCakeFormName(cake.name);
    setCakeFormCategory(cake.category || 'classic');
    setCakeFormDescription(cake.description);
    setCakeFormStartingPrice(String(cake.startingPrice));
    setCakeFormSizeNote(cake.sizePriceNote || `From $${cake.startingPrice}`);
    setCakeFormTag(cake.tag || 'Bestseller');
    setCakeFormTagType(cake.tagType || 'bestseller');
    setCakeFormImageUrl(cake.imageUrl);
    setCakeFormFlavours(cake.flavours ? cake.flavours.join(', ') : '');
    setCakeFormIsEggless(Boolean(cake.isEggless));
    setCakeFormDietaryNote(cake.dietaryNote || (cake.isEggless ? '100% Eggless' : 'Contains Eggs'));
    setCakeFormIsAvailable(cake.isAvailable !== false);
    setCakeFormIsFeatured(Boolean(cake.isFeatured));
    setCakeFormLeadTime(String(cake.leadTimeHours || 48));
    setCakeFormCustomizations(cake.customizations || '');
    setCakeFormSizes(
      cake.sizes && cake.sizes.length > 0
        ? cake.sizes
        : [{ size: 'Standard (8-10 servings)', servings: '8-10 guests', price: cake.startingPrice }]
    );
    setCakeFormError(null);
    setIsCakeModalOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCakeFormError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setCakeFormError('Image size exceeds 8MB. Please choose a smaller photo.');
      return;
    }

    setUploadingImage(true);
    setCakeFormError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            dataUrl: base64Data,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to upload image.');
        }

        setCakeFormImageUrl(data.url);
        setActionSuccess('Image uploaded and optimized successfully!');
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (err: any) {
        setCakeFormError(err.message || 'Image upload failed.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCake = async (e: React.FormEvent) => {
    e.preventDefault();
    setCakeFormError(null);

    if (!cakeFormName.trim()) {
      setCakeFormError('Cake name is required.');
      return;
    }
    if (!cakeFormDescription.trim()) {
      setCakeFormError('Cake description is required.');
      return;
    }
    if (!cakeFormStartingPrice || isNaN(Number(cakeFormStartingPrice)) || Number(cakeFormStartingPrice) <= 0) {
      setCakeFormError('Please enter a valid starting price.');
      return;
    }
    if (!cakeFormImageUrl.trim()) {
      setCakeFormError('Please upload an image or provide an image URL.');
      return;
    }

    setCakeSaving(true);

    const payload = {
      name: cakeFormName.trim(),
      category: cakeFormCategory.toLowerCase().trim(),
      description: cakeFormDescription.trim(),
      startingPrice: parseFloat(cakeFormStartingPrice),
      sizePriceNote: cakeFormSizeNote.trim() || `From $${cakeFormStartingPrice}`,
      tag: cakeFormTag.trim() || 'New Arrival',
      tagType: cakeFormTagType,
      imageUrl: cakeFormImageUrl.trim(),
      flavours: cakeFormFlavours
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      isEggless: cakeFormIsEggless,
      dietaryNote: cakeFormDietaryNote.trim() || (cakeFormIsEggless ? '100% Eggless' : 'Contains Eggs'),
      isAvailable: cakeFormIsAvailable,
      isFeatured: cakeFormIsFeatured,
      leadTimeHours: parseInt(cakeFormLeadTime, 10) || 48,
      customizations: cakeFormCustomizations.trim(),
      sizes: cakeFormSizes,
    };

    try {
      const endpoint = editingCakeId ? `/api/cakes/${editingCakeId}` : '/api/cakes';
      const method = editingCakeId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save cake model.');
      }

      setActionSuccess(
        editingCakeId
          ? `Cake model "${payload.name}" updated successfully in PostgreSQL!`
          : `New cake model "${payload.name}" created and published to catalogue!`
      );
      setIsCakeModalOpen(false);
      fetchCakes();
      if (onCakesUpdated) onCakesUpdated();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      setCakeFormError(err.message || 'Error saving cake model.');
    } finally {
      setCakeSaving(false);
    }
  };

  const handleToggleCakeAvailability = async (cake: CakeItem) => {
    try {
      const newStatus = !cake.isAvailable;
      const res = await fetch(`/api/cakes/${cake.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus }),
      });
      if (res.ok) {
        setActionSuccess(`"${cake.name}" is now marked as ${newStatus ? 'AVAILABLE' : 'OUT OF STOCK'}`);
        fetchCakes();
        if (onCakesUpdated) onCakesUpdated();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err: any) {
      alert('Failed to update availability: ' + err.message);
    }
  };

  const handleDeleteCake = async (cake: CakeItem) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${cake.name}" from the catalogue?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/cakes/${cake.id}`, { method: 'DELETE' });
      if (res.ok) {
        setActionSuccess(`Cake model "${cake.name}" removed from database.`);
        fetchCakes();
        if (onCakesUpdated) onCakesUpdated();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err: any) {
      alert('Failed to delete cake: ' + err.message);
    }
  };

  // Add / remove size tier in form
  const handleAddSizeTier = () => {
    setCakeFormSizes([
      ...cakeFormSizes,
      { size: 'Tier Size', servings: '10-12 guests', price: parseFloat(cakeFormStartingPrice) || 75 },
    ]);
  };

  const handleRemoveSizeTier = (index: number) => {
    setCakeFormSizes(cakeFormSizes.filter((_, i) => i !== index));
  };

  const handleSizeChange = (index: number, field: keyof CakeSizeTier, val: any) => {
    const updated = [...cakeFormSizes];
    updated[index] = { ...updated[index], [field]: val };
    setCakeFormSizes(updated);
  };

  // ==========================================
  // INQUIRY & WHATSAPP HANDLERS
  // ==========================================

  const handleUpdateInquiry = async () => {
    if (!selectedInquiry) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          internalNotes,
          estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.inquiry) {
        setActionSuccess('Inquiry successfully updated in database!');
        setSelectedInquiry(data.inquiry);
        fetchInquiries();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err: any) {
      alert('Error updating inquiry: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer inquiry?')) return;
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedInquiry(null);
        fetchInquiries();
        fetchHealth();
      }
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  const handleSendWhatsAppReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedInquiry.phone,
          text: replyMessage,
          inquiryId: selectedInquiry.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`WhatsApp response logged (${data.status})!`);
        fetchLogs();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err: any) {
      alert('Error sending WhatsApp message: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTriggerSimulatedWebhook = async () => {
    try {
      const fakePayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '918056702505', phone_number_id: '10000000000' },
                  messages: [
                    {
                      from: simPhone,
                      id: `wamid.webhook.${Date.now()}`,
                      timestamp: Math.floor(Date.now() / 1000).toString(),
                      text: { body: simText },
                      type: 'text',
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const res = await fetch('/api/webhooks/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fakePayload),
      });

      if (res.ok) {
        setActionSuccess('Simulated WhatsApp Webhook event processed and saved to database!');
        fetchLogs();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err: any) {
      alert('Webhook trigger failed: ' + err.message);
    }
  };

  // Status color pill
  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONTACTED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'QUOTED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter cakes for table
  const filteredCakes = cakes.filter((c) => {
    if (cakeCategoryFilter !== 'ALL' && c.category?.toLowerCase() !== cakeCategoryFilter.toLowerCase()) {
      return false;
    }
    if (cakeSearch.trim()) {
      const q = cakeSearch.toLowerCase().trim();
      const matchName = c.name.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchFlavour = c.flavours?.some((f) => f.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchFlavour) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-6xl rounded-2xl shadow-2xl border border-[#d4c3c1]/50 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-[#321917] text-white flex items-center justify-between border-b border-[#4a2e2b]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#bd9953] flex items-center justify-center text-[#321917]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium tracking-wide">
                Artisanal Patisserie Owner & Admin Portal
              </h2>
              <div className="text-[11px] text-[#e7bdb8] flex items-center gap-2">
                <span>Database: {dbInfo?.database?.storageEngine || 'PostgreSQL'}</span>
                <span>•</span>
                <span>Cakes: {cakes.length}</span>
                <span>•</span>
                <span>Inquiries: {inquiries.length}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchCakes();
                fetchInquiries();
                fetchLogs();
                fetchHealth();
              }}
              className="p-2 rounded-lg bg-[#4a2e2b] hover:bg-[#5d3f3c] text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading || loadingCakes ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#4a2e2b] text-[#e7bdb8] hover:text-white transition-colors"
              title="Close Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Success Notification */}
        {actionSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="px-6 pt-4 pb-3 bg-[#fdf9f3] border-b border-[#f1ede7] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('cakes')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'cakes'
                  ? 'bg-[#4a2e2b] text-white shadow-sm'
                  : 'bg-white border border-[#d4c3c1]/40 text-[#504443] hover:text-[#321917]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">cake</span>
              <span>Cake Management ({cakes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'inquiries'
                  ? 'bg-[#4a2e2b] text-white shadow-sm'
                  : 'bg-white border border-[#d4c3c1]/40 text-[#504443] hover:text-[#321917]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Inquiries Registry ({inquiries.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'whatsapp'
                  ? 'bg-[#4a2e2b] text-white shadow-sm'
                  : 'bg-white border border-[#d4c3c1]/40 text-[#504443] hover:text-[#321917]'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp API & Logs ({messageLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'database'
                  ? 'bg-[#4a2e2b] text-white shadow-sm'
                  : 'bg-white border border-[#d4c3c1]/40 text-[#504443] hover:text-[#321917]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>PostgreSQL Schema</span>
            </button>
          </div>

          {activeTab === 'cakes' && (
            <button
              onClick={openAddCakeModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#bd9953] text-[#321917] hover:bg-[#bd9953]/90 text-xs font-bold tracking-wider uppercase shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Cake Model</span>
            </button>
          )}
        </div>

        {/* =========================================
            TAB 1: CAKE MANAGEMENT SECTION
            ========================================= */}
        {activeTab === 'cakes' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#fdf9f3]/40">
            {/* Search & Category Filter Controls */}
            <div className="bg-white p-4 rounded-xl border border-[#d4c3c1]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#827472] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search cake name, flavours, ingredients..."
                  value={cakeSearch}
                  onChange={(e) => setCakeSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-full focus:outline-none focus:border-[#4a2e2b]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <span className="text-[11px] font-semibold text-[#827472] uppercase">Category:</span>
                {['ALL', 'chocolate', 'classic', 'wedding', 'entremets'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCakeCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      cakeCategoryFilter === cat
                        ? 'bg-[#321917] text-white shadow-xs'
                        : 'bg-[#f7f3ed] text-[#504443] hover:bg-[#ebe8e2]'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Cakes Product Table / Cards */}
            <div className="bg-white rounded-xl border border-[#d4c3c1]/30 overflow-hidden shadow-xs">
              <div className="px-5 py-3 border-b border-[#f1ede7] bg-[#fdf9f3] flex items-center justify-between">
                <div className="font-serif text-sm font-semibold text-[#321917]">
                  Active Cake Vitrine Models ({filteredCakes.length})
                </div>
                <div className="text-xs text-[#504443]">
                  Changes persist directly to PostgreSQL database
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f7f3ed] text-[#827472] uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Cake / Photo</th>
                      <th className="p-3">Category & Tag</th>
                      <th className="p-3">Base Price</th>
                      <th className="p-3">Dietary</th>
                      <th className="p-3">Availability</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1ede7]">
                    {loadingCakes ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#827472]">
                          Loading cake models from PostgreSQL...
                        </td>
                      </tr>
                    ) : filteredCakes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#827472]">
                          No cake models found. Click <strong>Add New Cake Model</strong> to publish your first creation!
                        </td>
                      </tr>
                    ) : (
                      filteredCakes.map((cake) => (
                        <tr key={cake.id} className="hover:bg-[#fdf9f3]/60 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={cake.imageUrl}
                                alt={cake.name}
                                className="w-12 h-12 rounded-lg object-cover border border-[#d4c3c1]/40 shrink-0"
                              />
                              <div>
                                <div className="font-semibold text-sm text-[#1c1c18]">{cake.name}</div>
                                <div className="text-[11px] text-[#504443] max-w-xs truncate">
                                  {cake.description}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3">
                            <span className="font-semibold text-[#321917] capitalize">{cake.category}</span>
                            {cake.tag && (
                              <span className="block text-[10px] text-[#7c5357] font-semibold mt-0.5">
                                • {cake.tag}
                              </span>
                            )}
                          </td>

                          <td className="p-3 font-mono font-bold text-sm text-[#4a2e2b]">
                            ${cake.startingPrice}
                            <span className="block text-[10px] text-[#827472] font-normal">
                              {cake.sizes?.length || 1} size tier(s)
                            </span>
                          </td>

                          <td className="p-3">
                            {cake.isEggless ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <span>🌿</span> Eggless
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#504443]">Regular</span>
                            )}
                          </td>

                          <td className="p-3">
                            <button
                              onClick={() => handleToggleCakeAvailability(cake)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-colors ${
                                cake.isAvailable !== false
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                              title="Click to toggle availability on website"
                            >
                              {cake.isAvailable !== false ? 'IN STOCK' : 'OUT OF STOCK'}
                            </button>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditCakeModal(cake)}
                                className="p-1.5 rounded-lg bg-[#f7f3ed] hover:bg-[#ebe8e2] text-[#321917] transition-colors"
                                title="Edit Cake"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCake(cake)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                                title="Delete Cake"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 2: INQUIRIES REGISTRY
            ========================================= */}
        {activeTab === 'inquiries' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left list */}
            <div className="w-full md:w-1/2 border-r border-[#f1ede7] flex flex-col overflow-hidden bg-white">
              <div className="p-4 border-b border-[#f1ede7] space-y-3 bg-[#fdf9f3]/50">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#827472] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by client name, reference code, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#d4c3c1]/40 rounded-full focus:outline-none focus:border-[#4a2e2b]"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-[#827472] font-semibold uppercase mr-1">Status:</span>
                  {['ALL', 'NEW', 'CONTACTED', 'QUOTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                        statusFilter === st
                          ? 'bg-[#321917] text-white'
                          : 'bg-white border border-[#d4c3c1]/30 text-[#504443] hover:bg-[#f7f3ed]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inquiry List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#f1ede7]">
                {loading ? (
                  <div className="p-8 text-center text-xs text-[#827472]">Loading records from database...</div>
                ) : inquiries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#827472]">
                    No inquiries found matching your filters.
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      onClick={() => setSelectedInquiry(inq)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-[#f7f3ed] ${
                        selectedInquiry?.id === inq.id ? 'bg-[#f7f3ed] border-l-4 border-[#4a2e2b]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[#321917]">{inq.referenceCode}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(inq.status)}`}>
                          {inq.status}
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-[#1c1c18]">{inq.clientName}</div>
                      <div className="text-xs text-[#504443] mt-0.5">{inq.occasion} • {inq.flavourProfile}</div>
                      <div className="flex items-center justify-between text-[11px] text-[#827472] mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {inq.eventDate}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-[#7c5357]" /> {inq.phone}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right details view */}
            <div className="w-full md:w-1/2 flex-1 p-6 overflow-y-auto bg-[#fdf9f3]/30">
              {selectedInquiry ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f1ede7]">
                    <div>
                      <div className="text-[11px] uppercase font-semibold text-[#827472]">Inquiry Dossier</div>
                      <div className="font-mono text-base font-bold text-[#321917]">{selectedInquiry.referenceCode}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${selectedInquiry.phone}?text=${encodeURIComponent(
                          `Bonjour ${selectedInquiry.clientName}! This is Artisanal Patisserie Atelier regarding your enquiry [${selectedInquiry.referenceCode}].`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:opacity-90 shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>Chat on WhatsApp</span>
                      </a>
                      <button
                        onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                        className="p-1.5 rounded-full text-red-600 hover:bg-red-50 border border-red-200"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#d4c3c1]/30 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#827472] block">Client Name</span>
                      <strong className="text-sm text-[#1c1c18]">{selectedInquiry.clientName}</strong>
                    </div>
                    <div>
                      <span className="text-[#827472] block">Contact Phone</span>
                      <strong className="text-sm text-[#1c1c18] font-mono">{selectedInquiry.phone}</strong>
                    </div>
                    <div>
                      <span className="text-[#827472] block">Occasion</span>
                      <strong className="text-[#1c1c18]">{selectedInquiry.occasion}</strong>
                    </div>
                    <div>
                      <span className="text-[#827472] block">Event Date</span>
                      <strong className="text-[#1c1c18]">{selectedInquiry.eventDate}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#827472] block">Flavour & Profile</span>
                      <strong className="text-[#1c1c18]">{selectedInquiry.flavourProfile}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#827472] block">Guest Count / Tier Size</span>
                      <strong className="text-[#1c1c18]">{selectedInquiry.guestCount}</strong>
                    </div>
                    {selectedInquiry.designNotes && (
                      <div className="col-span-2 pt-2 border-t border-[#f1ede7]">
                        <span className="text-[#827472] block">Design Notes & Requests:</span>
                        <p className="text-[#504443] mt-1 bg-[#f7f3ed] p-2.5 rounded-lg whitespace-pre-wrap">
                          {selectedInquiry.designNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#d4c3c1]/30 space-y-4">
                    <h4 className="font-serif text-sm font-semibold text-[#321917] flex items-center gap-2">
                      <Edit className="w-4 h-4 text-[#7c5357]" />
                      <span>Pastry Concierge Management</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#827472] block mb-1 font-semibold">Update Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as InquiryStatus)}
                          className="w-full text-xs p-2 bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-lg"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUOTED">QUOTED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-[#827472] block mb-1 font-semibold">Estimated Quote ($)</label>
                        <input
                          type="number"
                          placeholder="e.g. 180"
                          value={estimatedPrice}
                          onChange={(e) => setEstimatedPrice(e.target.value)}
                          className="w-full text-xs p-2 bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-[#827472] block mb-1 font-semibold">Internal Chef Notes</label>
                      <textarea
                        rows={2}
                        placeholder="Add tasting consultation notes, delivery details, allergens..."
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        className="w-full text-xs p-2 bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-lg"
                      />
                    </div>

                    <button
                      onClick={handleUpdateInquiry}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-lg bg-[#4a2e2b] text-white text-xs font-semibold hover:bg-[#321917] disabled:opacity-50"
                    >
                      {isUpdating ? 'Saving Changes...' : 'Save Updates to Database'}
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#25D366]/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-semibold text-[#1c1c18] flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-[#25D366] fill-current" />
                        <span>Send WhatsApp Response</span>
                      </h4>
                      <span className="text-[10px] text-[#827472]">Official Cloud API / Logged</span>
                    </div>

                    <textarea
                      rows={3}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full text-xs p-2.5 bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-lg font-sans"
                    />

                    <button
                      onClick={handleSendWhatsAppReply}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Official WhatsApp Message</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#827472]">
                  <Layers className="w-12 h-12 text-[#d4c3c1] mb-2" />
                  <p className="text-sm font-medium">Select an inquiry from the registry to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 3: WHATSAPP API & WEBHOOKS
            ========================================= */}
        {activeTab === 'whatsapp' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#fdf9f3]/40">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#d4c3c1]/30">
                <div className="text-[11px] uppercase font-semibold text-[#827472]">Configured WhatsApp Number</div>
                <div className="font-mono text-base font-bold text-[#321917] mt-1">+{config.whatsappNumber}</div>
                <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Click-to-Chat Active
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#d4c3c1]/30">
                <div className="text-[11px] uppercase font-semibold text-[#827472]">Meta Cloud API Status</div>
                <div className="font-medium text-sm text-[#1c1c18] mt-1">
                  {dbInfo?.whatsapp?.cloudApiConfigured ? 'Connected (Live Token)' : 'Ready for Meta System Token'}
                </div>
                <div className="text-[11px] text-[#827472] mt-1">Graph API {dbInfo?.whatsapp?.apiVersion || 'v21.0'}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#d4c3c1]/30">
                <div className="text-[11px] uppercase font-semibold text-[#827472]">Webhook Verify Token</div>
                <div className="font-mono text-xs text-[#321917] mt-1 truncate">
                  artisanal_patisserie_verify_token_secret
                </div>
                <div className="text-[11px] text-blue-600 mt-1">Endpoint: /api/webhooks/whatsapp</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#bd9953]/40 space-y-3">
              <h4 className="font-serif text-sm font-semibold text-[#321917]">
                Simulate Incoming Meta Webhook Message
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#827472] block mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full text-xs p-2 bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#827472] block mb-1">Incoming Message Body</label>
                  <input
                    type="text"
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                    className="w-full text-xs p-2 bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={handleTriggerSimulatedWebhook}
                className="px-4 py-2 rounded-lg bg-[#4a2e2b] text-white text-xs font-semibold hover:bg-[#321917]"
              >
                Send Webhook Event to /api/webhooks/whatsapp
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#d4c3c1]/30 overflow-hidden">
              <div className="px-5 py-3 border-b border-[#f1ede7] bg-[#fdf9f3] font-serif text-sm font-semibold text-[#321917]">
                WhatsApp Communication Logs ({messageLogs.length} events)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f7f3ed] text-[#827472] uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Direction</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Message Preview</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1ede7]">
                    {messageLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-[#827472]">
                          No message logs recorded yet.
                        </td>
                      </tr>
                    ) : (
                      messageLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#fdf9f3]">
                          <td className="p-3 text-[#827472] whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="p-3 font-semibold">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] ${
                                log.direction === 'INBOUND' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {log.direction}
                            </span>
                          </td>
                          <td className="p-3 text-[#504443] font-mono text-[10px]">{log.channel}</td>
                          <td className="p-3 font-mono text-[#1c1c18]">{log.recipientPhone || log.senderPhone}</td>
                          <td className="p-3 text-[#504443] max-w-xs truncate">{log.messageContent}</td>
                          <td className="p-3">
                            <span className="font-semibold text-emerald-700">{log.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 4: POSTGRESQL SCHEMA
            ========================================= */}
        {activeTab === 'database' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#fdf9f3]/40">
            <div className="bg-white p-5 rounded-xl border border-[#d4c3c1]/30 space-y-3">
              <h3 className="font-serif text-base font-semibold text-[#321917] flex items-center gap-2">
                <Database className="w-5 h-5 text-[#bd9953]" />
                <span>PostgreSQL Database Architecture & Dynamic Models</span>
              </h3>
              <p className="text-xs text-[#504443] leading-relaxed">
                The database stores dynamic cake models, pricing tiers, customer inquiries, and Meta WhatsApp logs. Any changes made by the pastry chef or admin persist permanently across restarts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-[#f7f3ed] border border-[#d4c3c1]/30">
                  <div className="font-mono text-xs font-bold text-[#321917]">cakes</div>
                  <div className="text-[11px] text-[#504443] mt-1">
                    Stores all published cake models, categories, pricing tiers, photos, flavours, eggless status, and availability.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#f7f3ed] border border-[#d4c3c1]/30">
                  <div className="font-mono text-xs font-bold text-[#321917]">inquiries</div>
                  <div className="text-[11px] text-[#504443] mt-1">
                    Stores customer bespoke inquiries, celebration dates, guest counts, and unique references.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#f7f3ed] border border-[#d4c3c1]/30">
                  <div className="font-mono text-xs font-bold text-[#321917]">message_logs</div>
                  <div className="text-[11px] text-[#504443] mt-1">
                    Audits incoming and outbound Meta WhatsApp Cloud API webhooks and delivery status receipts.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================
          ADD / EDIT CAKE MODAL
          ========================================= */}
      {isCakeModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-[#d4c3c1]/50 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Top */}
            <div className="px-6 py-4 bg-[#321917] text-white flex items-center justify-between border-b border-[#4a2e2b]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#bd9953] text-xl">cake</span>
                <h3 className="font-serif text-base sm:text-lg font-medium">
                  {editingCakeId ? 'Edit Cake Model' : 'Add New Cake Model'}
                </h3>
              </div>
              <button
                onClick={() => setIsCakeModalOpen(false)}
                className="p-1 rounded-full text-[#e7bdb8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCake} className="p-6 overflow-y-auto space-y-5">
              {cakeFormError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cakeFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#504443] uppercase tracking-wider mb-1">
                    Cake Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Opera Ganache Royale"
                    value={cakeFormName}
                    onChange={(e) => setCakeFormName(e.target.value)}
                    className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-xl px-4 py-2 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-[#504443] uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={cakeFormCategory}
                    onChange={(e) => setCakeFormCategory(e.target.value)}
                    className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-xl px-3 py-2 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                  >
                    <option value="chocolate">Decadent Chocolate</option>
                    <option value="classic">Celebration Classics</option>
                    <option value="wedding">Bridal & Elegance</option>
                    <option value="entremets">French Entremets</option>
                    <option value="birthday">Birthday Masterpiece</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="custom">Bespoke Custom</option>
                  </select>
                </div>

                {/* Starting Price */}
                <div>
                  <label className="block text-xs font-semibold text-[#504443] uppercase tracking-wider mb-1">
                    Base Starting Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="68"
                    value={cakeFormStartingPrice}
                    onChange={(e) => setCakeFormStartingPrice(e.target.value)}
                    className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-xl px-4 py-2 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                  />
                </div>

                {/* Tag & Tag Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#504443] uppercase tracking-wider mb-1">
                    Promotional Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bestseller, Chef's Signature"
                    value={cakeFormTag}
                    onChange={(e) => setCakeFormTag(e.target.value)}
                    className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-xl px-4 py-2 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#504443] uppercase tracking-wider mb-1">
                    Tag Style
                  </label>
                  <select
                    value={cakeFormTagType}
                    onChange={(e) => setCakeFormTagType(e.target.value as any)}
                    className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-xl px-3 py-2 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                  >
                    <option value="bestseller">Ganache (Bestseller)</option>
                    <option value="signature">Rose Glaze (Signature)</option>
                    <option value="consultation">Brushed Gold (Consultation)</option>
                    <option value="gift">Neutral (Gift Box)</option>
                    <option value="new">Gold (New Arrival)</option>
                  </select>
                </div>

                {/* Size / Serving Note */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#504443] uppercase tracking-wider mb-1">
                    Portion & Sizing Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sizes: 6-inch (8-10) | 8-inch (14-16) · From $68"
                    value={cakeFormSizeNote}
                    onChange={(e) => setCakeFormSizeNote(e.target.value)}
                    className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-xl px-4 py-2 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#504443] uppercase tracking-wider mb-1">
                    Description & Provenance *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Artisanal description of sponges, creams, fillings and origin..."
                    value={cakeFormDescription}
                    onChange={(e) => setCakeFormDescription(e.target.value)}
                    className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-xl px-4 py-2 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                  />
                </div>

                {/* Image Upload & Preview */}
                <div className="sm:col-span-2 bg-[#fdf9f3] p-4 rounded-xl border border-[#d4c3c1]/40 space-y-3">
                  <label className="block text-xs font-semibold text-[#321917] uppercase tracking-wider">
                    Cake Photo / Image *
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-[#d4c3c1]/40 shrink-0 flex items-center justify-center relative">
                      {cakeFormImageUrl ? (
                        <img
                          src={cakeFormImageUrl}
                          alt="Cake Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-[#d4c3c1]" />
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px]">
                          Uploading...
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-lg bg-[#4a2e2b] text-white text-xs font-semibold hover:bg-[#321917] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image File</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileUpload}
                        />
                        <span className="text-[11px] text-[#827472]">or paste direct image URL below:</span>
                      </div>

                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={cakeFormImageUrl}
                        onChange={(e) => setCakeFormImageUrl(e.target.value)}
                        className="w-full bg-white border border-[#d4c3c1]/40 rounded-lg px-3 py-1.5 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                      />
                    </div>
                  </div>
                </div>

                {/* Available Sizes Builder */}
                <div className="sm:col-span-2 bg-[#fdf9f3] p-4 rounded-xl border border-[#d4c3c1]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#321917] uppercase tracking-wider">
                      Available Size Tiers & Prices
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSizeTier}
                      className="text-xs text-[#7c5357] hover:text-[#321917] font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tier</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {cakeFormSizes.map((tier, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Tier Name (e.g. 6-inch Round)"
                          value={tier.size}
                          onChange={(e) => handleSizeChange(idx, 'size', e.target.value)}
                          className="flex-1 bg-white border border-[#d4c3c1]/40 rounded-lg px-3 py-1.5 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Servings (e.g. 8-10 guests)"
                          value={tier.servings}
                          onChange={(e) => handleSizeChange(idx, 'servings', e.target.value)}
                          className="w-32 bg-white border border-[#d4c3c1]/40 rounded-lg px-3 py-1.5 text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={tier.price}
                          onChange={(e) => handleSizeChange(idx, 'price', parseFloat(e.target.value) || 0)}
                          className="w-20 bg-white border border-[#d4c3c1]/40 rounded-lg px-3 py-1.5 text-xs font-mono"
                        />
                        {cakeFormSizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSizeTier(idx)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flavours */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#504443] uppercase tracking-wider mb-1">
                    Flavour Profile Options (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 70% Dark Truffle, Madagascar Vanilla, Salted Caramel"
                    value={cakeFormFlavours}
                    onChange={(e) => setCakeFormFlavours(e.target.value)}
                    className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-xl px-4 py-2 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                  />
                </div>

                {/* Dietary Note */}
                <div>
                  <label className="block text-xs font-semibold text-[#504443] uppercase tracking-wider mb-1">
                    Dietary Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Eggless or Contains Almonds"
                    value={cakeFormDietaryNote}
                    onChange={(e) => setCakeFormDietaryNote(e.target.value)}
                    className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-xl px-4 py-2 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                  />
                </div>

                {/* Lead Time Hours */}
                <div>
                  <label className="block text-xs font-semibold text-[#504443] uppercase tracking-wider mb-1">
                    Advance Notice (Hours)
                  </label>
                  <input
                    type="number"
                    min="12"
                    step="12"
                    placeholder="48"
                    value={cakeFormLeadTime}
                    onChange={(e) => setCakeFormLeadTime(e.target.value)}
                    className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-xl px-4 py-2 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                  />
                </div>

                {/* Customizations */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#504443] uppercase tracking-wider mb-1">
                    Available Customization Touches
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24k gold leaf, message inscription, fresh roses"
                    value={cakeFormCustomizations}
                    onChange={(e) => setCakeFormCustomizations(e.target.value)}
                    className="w-full bg-[#fdf9f3] border border-[#d4c3c1]/40 rounded-xl px-4 py-2 text-xs text-[#1c1c18] focus:outline-none focus:border-[#4a2e2b]"
                  />
                </div>

                {/* Toggles (Eggless, Available, Featured) */}
                <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2 border-t border-[#f1ede7]">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1c1c18]">
                    <input
                      type="checkbox"
                      checked={cakeFormIsEggless}
                      onChange={(e) => {
                        setCakeFormIsEggless(e.target.checked);
                        if (e.target.checked) setCakeFormDietaryNote('100% Eggless');
                      }}
                      className="w-4 h-4 rounded text-[#4a2e2b] focus:ring-[#4a2e2b]"
                    />
                    <span>🌿 100% Eggless Cake</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1c1c18]">
                    <input
                      type="checkbox"
                      checked={cakeFormIsAvailable}
                      onChange={(e) => setCakeFormIsAvailable(e.target.checked)}
                      className="w-4 h-4 rounded text-[#4a2e2b] focus:ring-[#4a2e2b]"
                    />
                    <span>Available to Order</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1c1c18]">
                    <input
                      type="checkbox"
                      checked={cakeFormIsFeatured}
                      onChange={(e) => setCakeFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#4a2e2b] focus:ring-[#4a2e2b]"
                    />
                    <span>Featured in Vitrine</span>
                  </label>
                </div>
              </div>

              {/* Form Bottom Actions */}
              <div className="pt-4 border-t border-[#f1ede7] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCakeModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#d4c3c1]/40 text-[#504443] hover:bg-[#f7f3ed] text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={cakeSaving}
                  className="px-6 py-2.5 rounded-full bg-[#4a2e2b] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#321917] disabled:opacity-50 shadow-sm active:scale-95 transition-all"
                >
                  {cakeSaving ? 'Saving to Database...' : editingCakeId ? 'Update Cake Model' : 'Publish Cake to Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
