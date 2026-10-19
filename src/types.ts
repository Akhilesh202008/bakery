export type CakeCategory =
  | 'all'
  | 'chocolate'
  | 'classic'
  | 'wedding'
  | 'entremets'
  | 'birthday'
  | 'anniversary'
  | 'custom'
  | 'eggless';

export interface CakeSizeTier {
  size: string;
  servings: string;
  price: number;
}

export interface CakeItem {
  id: string;
  name: string;
  slug?: string;
  tag?: string;
  tagType?: 'bestseller' | 'signature' | 'consultation' | 'gift' | 'new';
  category: string;
  description: string;
  sizePrice?: string;
  sizePriceNote?: string;
  startingPrice: number;
  sizes?: CakeSizeTier[];
  imageUrl: string;
  altText?: string;
  flavours: string[];
  isEggless?: boolean;
  dietaryNote?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  leadTimeHours?: number;
  customizations?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type InquiryStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Inquiry {
  id: string;
  referenceCode: string;
  clientName: string;
  phone: string;
  email?: string;
  occasion: string;
  flavourProfile: string;
  guestCount: string;
  eventDate: string;
  designNotes?: string;
  status: InquiryStatus;
  internalNotes?: string;
  estimatedPrice?: number;
  whatsappSent: boolean;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageLog {
  id: string;
  inquiryId?: string;
  direction: 'INBOUND' | 'OUTBOUND';
  channel: string;
  recipientPhone: string;
  senderPhone?: string;
  messageContent: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  metaMessageId?: string;
  errorPayload?: string;
  createdAt: string;
}

export interface AppConfig {
  primaryContactPhone: string;
  secondaryContactPhone: string;
  whatsappNumber: string;
  flagshipPhoneDisplay: string;
  flagshipPhoneDial: string;
}
