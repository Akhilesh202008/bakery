import crypto from 'node:crypto';
import { db } from './db.js';

export interface WhatsAppConfig {
  accessToken?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  verifyToken: string;
  appSecret?: string;
  apiVersion: string;
  primaryContactPhone: string;
  secondaryContactPhone: string;
  configuredWhatsAppNumber: string;
}

export const getWhatsAppConfig = (): WhatsAppConfig => {
  return {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN?.trim(),
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID?.trim(),
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim(),
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'artisanal_patisserie_verify_token_secret',
    appSecret: process.env.WHATSAPP_APP_SECRET?.trim(),
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
    primaryContactPhone: process.env.PRIMARY_CONTACT_PHONE || '8056702505',
    secondaryContactPhone: process.env.SECONDARY_CONTACT_PHONE || '7401039450',
    configuredWhatsAppNumber: process.env.WHATSAPP_PHONE_NUMBER || '918056702505',
  };
};

/**
 * Normalizes phone numbers to international format without plus sign or spaces.
 * e.g., "8056702505" -> "918056702505", "+1 (555) 019-2834" -> "15550192834"
 */
export function normalizePhoneNumber(raw: string, defaultCountryCode = '91'): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${defaultCountryCode}${digits}`;
  }
  return digits;
}

/**
 * Builds official click-to-chat URL: https://wa.me/INTERNATIONAL_NUMBER?text=ENCODED_MESSAGE
 */
export function buildClickToChatUrl(phone: string, text: string): string {
  const normalized = normalizePhoneNumber(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

/**
 * Verifies Meta Webhook HMAC-SHA256 signature
 */
export function verifyMetaSignature(rawBody: string, signatureHeader?: string, appSecret?: string): boolean {
  if (!appSecret || !signatureHeader) return true; // If secret not set in dev, allow
  try {
    const [algorithm, signature] = signatureHeader.split('=');
    if (algorithm !== 'sha256' || !signature) return false;
    const hmac = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(hmac, 'utf8'));
  } catch {
    return false;
  }
}

/**
 * Sends a message using the official Meta WhatsApp Business Cloud API.
 * Returns the Meta message id or status details.
 */
export async function sendMetaCloudApiMessage(params: {
  to: string;
  text?: string;
  templateName?: string;
  templateLanguage?: string;
  inquiryId?: string;
}): Promise<{ success: boolean; metaMessageId?: string; error?: string; status: 'SENT' | 'SIMULATED' | 'FAILED' }> {
  const config = getWhatsAppConfig();
  const recipient = normalizePhoneNumber(params.to);

  if (!config.accessToken || !config.phoneNumberId) {
    console.warn('[WhatsApp Cloud API] Meta credentials not fully configured. Simulating outbound message delivery.');
    const simWamid = `wamid.simulated.${Date.now()}.${Math.random().toString(36).substring(2, 8)}`;
    
    await db.logMessage({
      inquiryId: params.inquiryId,
      direction: 'OUTBOUND',
      channel: 'WHATSAPP_CLOUD_API (SIMULATED)',
      recipientPhone: recipient,
      senderPhone: config.configuredWhatsAppNumber,
      messageContent: params.text || `Template: ${params.templateName}`,
      status: 'SENT',
      metaMessageId: simWamid,
    });

    return {
      success: true,
      metaMessageId: simWamid,
      status: 'SIMULATED',
    };
  }

  const endpoint = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  const payload: Record<string, any> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
  };

  if (params.templateName) {
    payload.type = 'template';
    payload.template = {
      name: params.templateName,
      language: {
        code: params.templateLanguage || 'en_US',
      },
    };
  } else if (params.text) {
    payload.type = 'text';
    payload.text = {
      preview_url: false,
      body: params.text,
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: any = await res.json();

    if (!res.ok) {
      const errMsg = data.error?.message || `HTTP ${res.status}`;
      await db.logMessage({
        inquiryId: params.inquiryId,
        direction: 'OUTBOUND',
        channel: 'WHATSAPP_CLOUD_API',
        recipientPhone: recipient,
        senderPhone: config.phoneNumberId,
        messageContent: params.text || `Template: ${params.templateName}`,
        status: 'FAILED',
        errorPayload: JSON.stringify(data.error),
      });

      return {
        success: false,
        error: errMsg,
        status: 'FAILED',
      };
    }

    const metaMessageId = data.messages?.[0]?.id || `wamid.${Date.now()}`;

    await db.logMessage({
      inquiryId: params.inquiryId,
      direction: 'OUTBOUND',
      channel: 'WHATSAPP_CLOUD_API',
      recipientPhone: recipient,
      senderPhone: config.phoneNumberId,
      messageContent: params.text || `Template: ${params.templateName}`,
      status: 'SENT',
      metaMessageId,
    });

    return {
      success: true,
      metaMessageId,
      status: 'SENT',
    };
  } catch (err: any) {
    console.error('[WhatsApp Cloud API] Network error calling Meta Graph API:', err);
    await db.logMessage({
      inquiryId: params.inquiryId,
      direction: 'OUTBOUND',
      channel: 'WHATSAPP_CLOUD_API',
      recipientPhone: recipient,
      messageContent: params.text || `Template: ${params.templateName}`,
      status: 'FAILED',
      errorPayload: err.message,
    });

    return {
      success: false,
      error: err.message,
      status: 'FAILED',
    };
  }
}
