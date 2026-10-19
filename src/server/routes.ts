import { Router, Request, Response } from 'express';
import { db } from './db.js';
import {
  getWhatsAppConfig,
  normalizePhoneNumber,
  buildClickToChatUrl,
  sendMetaCloudApiMessage,
  verifyMetaSignature,
} from './whatsapp.js';

export const apiRouter = Router();

// 1. Health & Integration Status
apiRouter.get('/health', (req: Request, res: Response) => {
  const waConfig = getWhatsAppConfig();
  const dbStatus = db.getStatus();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Artisanal Patisserie Boutique Server',
    database: dbStatus,
    whatsapp: {
      cloudApiConfigured: Boolean(waConfig.accessToken && waConfig.phoneNumberId),
      apiVersion: waConfig.apiVersion,
      primaryContactPhone: waConfig.primaryContactPhone,
      secondaryContactPhone: waConfig.secondaryContactPhone,
      whatsappNumber: waConfig.configuredWhatsAppNumber,
      webhookVerifyTokenConfigured: Boolean(waConfig.verifyToken),
    },
  });
});

// 2. Public Boutique Config
apiRouter.get('/config', (req: Request, res: Response) => {
  const config = getWhatsAppConfig();
  res.json({
    primaryContactPhone: config.primaryContactPhone,
    secondaryContactPhone: config.secondaryContactPhone,
    whatsappNumber: config.configuredWhatsAppNumber,
    flagshipPhoneDisplay: '+1 (555) 019-2834',
    flagshipPhoneDial: '+15550192834',
  });
});

// 3. Customer Inquiry Submission
apiRouter.post('/inquiries', async (req: Request, res: Response) => {
  try {
    const { clientName, phone, email, occasion, flavourProfile, guestCount, eventDate, designNotes } = req.body;

    // Validation
    if (!clientName || !clientName.trim()) {
      return res.status(400).json({ error: 'Client name is required.' });
    }
    if (!phone || !phone.trim() || phone.replace(/\D/g, '').length < 7) {
      return res.status(400).json({ error: 'Valid contact phone number is required.' });
    }
    if (!occasion) {
      return res.status(400).json({ error: 'Occasion is required.' });
    }
    if (!flavourProfile) {
      return res.status(400).json({ error: 'Flavour profile selection is required.' });
    }
    if (!guestCount) {
      return res.status(400).json({ error: 'Guest count is required.' });
    }
    if (!eventDate) {
      return res.status(400).json({ error: 'Event date is required.' });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    const code = `AP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const inquiry = await db.createInquiry({
      referenceCode: code,
      clientName: clientName.trim(),
      phone: normalizedPhone,
      email: email ? email.trim() : undefined,
      occasion,
      flavourProfile,
      guestCount,
      eventDate,
      designNotes: designNotes ? designNotes.trim() : undefined,
      whatsappSent: true,
    });

    const waConfig = getWhatsAppConfig();
    
    // Construct prefilled WhatsApp Click-to-Chat message
    const waMessageText = 
      `Bonjour Artisanal Patisserie! 🍰\n` +
      `I have submitted a bespoke cake enquiry with reference [${code}].\n\n` +
      `• Name: ${clientName.trim()}\n` +
      `• Occasion: ${occasion}\n` +
      `• Flavour: ${flavourProfile}\n` +
      `• Guests: ${guestCount}\n` +
      `• Date: ${eventDate}\n` +
      (designNotes ? `• Notes: ${designNotes.trim()}\n` : '') +
      `\nPlease let me know your availability and consultation details.`;

    const clickToChatUrl = buildClickToChatUrl(waConfig.configuredWhatsAppNumber, waMessageText);

    // Also attempt WhatsApp Cloud API automated acknowledgment if credentials are set
    const cloudApiResult = await sendMetaCloudApiMessage({
      to: normalizedPhone,
      text: `Bonjour ${clientName.trim()}! Your bespoke cake enquiry [${code}] for ${occasion} on ${eventDate} has been safely logged with Artisanal Patisserie. Our pastry team will review your requests.`,
      inquiryId: inquiry.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Your bespoke inquiry has been registered successfully.',
      inquiry,
      clickToChatUrl,
      whatsappCloudApiStatus: cloudApiResult.status,
    });
  } catch (err: any) {
    console.error('[API] Error creating inquiry:', err);
    return res.status(500).json({ error: 'Internal server error processing inquiry: ' + err.message });
  }
});

// 4. Admin Get Inquiries
apiRouter.get('/inquiries', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const inquiries = await db.getInquiries({
      status: status as string,
      search: search as string,
    });
    return res.json({ inquiries });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Admin Get Single Inquiry
apiRouter.get('/inquiries/:id', async (req: Request, res: Response) => {
  try {
    const inquiry = await db.getInquiryById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }
    return res.json({ inquiry });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. Admin Update Inquiry
apiRouter.patch('/inquiries/:id', async (req: Request, res: Response) => {
  try {
    const { status, internalNotes, estimatedPrice } = req.body;
    const updated = await db.updateInquiry(req.params.id, {
      status,
      internalNotes,
      estimatedPrice: estimatedPrice !== undefined ? Number(estimatedPrice) : undefined,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }
    return res.json({ success: true, inquiry: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. Admin Delete Inquiry
apiRouter.delete('/inquiries/:id', async (req: Request, res: Response) => {
  try {
    const success = await db.deleteInquiry(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }
    return res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. Official Meta WhatsApp Webhook Verification
// Meta sends GET request with hub.mode, hub.verify_token, and hub.challenge
apiRouter.get('/webhooks/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const config = getWhatsAppConfig();

  if (mode === 'subscribe' && token === config.verifyToken) {
    console.log('[WhatsApp Webhook] Verification successful!');
    return res.status(200).send(challenge);
  } else {
    console.warn('[WhatsApp Webhook] Verification failed. Token mismatch.');
    return res.sendStatus(403);
  }
});

// 9. Official Meta WhatsApp Webhook Receiver
// Meta sends POST request with message events and delivery receipts
apiRouter.post('/webhooks/whatsapp', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const config = getWhatsAppConfig();

    if (config.appSecret && !verifyMetaSignature(JSON.stringify(req.body), signature, config.appSecret)) {
      console.warn('[WhatsApp Webhook] Signature verification failed.');
      return res.sendStatus(401);
    }

    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          if (!value) continue;

          // Handle incoming messages
          if (value.messages && value.messages.length > 0) {
            for (const msg of value.messages) {
              const sender = msg.from;
              const text = msg.text?.body || `[Media/Type: ${msg.type}]`;
              const metaId = msg.id;

              console.log(`[WhatsApp Webhook] Incoming message from ${sender}: ${text}`);

              await db.logMessage({
                direction: 'INBOUND',
                channel: 'WHATSAPP_CLOUD_API',
                recipientPhone: config.configuredWhatsAppNumber,
                senderPhone: sender,
                messageContent: text,
                status: 'DELIVERED',
                metaMessageId: metaId,
              });
            }
          }

          // Handle delivery receipts & read receipts
          if (value.statuses && value.statuses.length > 0) {
            for (const statusObj of value.statuses) {
              const metaId = statusObj.id;
              const statusName = (statusObj.status || '').toUpperCase();
              console.log(`[WhatsApp Webhook] Delivery status update: ${metaId} -> ${statusName}`);
            }
          }
        }
      }
    }

    return res.status(200).json({ status: 'EVENT_RECEIVED' });
  } catch (err: any) {
    console.error('[WhatsApp Webhook] Error processing event:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 10. Send Manual Message from Concierge / Admin
apiRouter.post('/whatsapp/send-message', async (req: Request, res: Response) => {
  try {
    const { to, text, inquiryId } = req.body;
    if (!to || !text) {
      return res.status(400).json({ error: 'Recipient phone and text content are required.' });
    }

    const result = await sendMetaCloudApiMessage({
      to,
      text,
      inquiryId,
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 11. View WhatsApp Communication Logs
apiRouter.get('/whatsapp/logs', async (req: Request, res: Response) => {
  try {
    const logs = await db.getMessageLogs();
    return res.json({ logs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 12. View Audit Logs
apiRouter.get('/audit/logs', async (req: Request, res: Response) => {
  try {
    const logs = await db.getAuditLogs();
    return res.json({ logs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 13. CAKE MANAGEMENT REST ENDPOINTS
// ==========================================

// GET /api/cakes - List all cakes (with optional filtering)
apiRouter.get('/cakes', async (req: Request, res: Response) => {
  try {
    const { category, search, availableOnly, egglessOnly } = req.query;
    const cakes = await db.getCakes({
      category: category as string,
      search: search as string,
      availableOnly: availableOnly === 'true',
      egglessOnly: egglessOnly === 'true',
    });
    return res.json({ cakes });
  } catch (err: any) {
    console.error('[API] Error fetching cakes:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/cakes/:id - Single cake details
apiRouter.get('/cakes/:id', async (req: Request, res: Response) => {
  try {
    const cake = await db.getCakeById(req.params.id);
    if (!cake) {
      return res.status(404).json({ error: 'Cake model not found.' });
    }
    return res.json({ cake });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/cakes - Create new cake model
apiRouter.post('/cakes', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      tag,
      tagType,
      startingPrice,
      sizePriceNote,
      sizes,
      imageUrl,
      altText,
      flavours,
      isEggless,
      dietaryNote,
      isAvailable,
      isFeatured,
      leadTimeHours,
      customizations,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Cake name is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Cake description is required.' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category selection is required.' });
    }
    if (!startingPrice || isNaN(Number(startingPrice)) || Number(startingPrice) <= 0) {
      return res.status(400).json({ error: 'A valid starting price greater than 0 is required.' });
    }
    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({ error: 'Cake image URL or upload is required.' });
    }

    const created = await db.createCake({
      name: name.trim(),
      description: description.trim(),
      category: category.toLowerCase().trim(),
      tag: tag?.trim() || 'New Arrival',
      tagType: tagType || 'new',
      startingPrice: Number(startingPrice),
      sizePriceNote: sizePriceNote?.trim(),
      sizes: Array.isArray(sizes) ? sizes : undefined,
      imageUrl: imageUrl.trim(),
      altText: altText?.trim() || name.trim(),
      flavours: Array.isArray(flavours)
        ? flavours
        : typeof flavours === 'string'
        ? flavours.split(',').map((f) => f.trim()).filter(Boolean)
        : [],
      isEggless: Boolean(isEggless),
      dietaryNote: dietaryNote?.trim() || (isEggless ? '100% Eggless' : 'Contains Eggs'),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      isFeatured: Boolean(isFeatured),
      leadTimeHours: leadTimeHours ? Number(leadTimeHours) : 48,
      customizations: customizations?.trim() || '',
    });

    return res.status(201).json({
      success: true,
      message: `Cake "${created.name}" created successfully.`,
      cake: created,
    });
  } catch (err: any) {
    console.error('[API] Error creating cake:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/cakes/:id - Update existing cake model
apiRouter.patch('/cakes/:id', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    if (updates.startingPrice !== undefined) {
      updates.startingPrice = Number(updates.startingPrice);
    }
    if (updates.category) {
      updates.category = updates.category.toLowerCase().trim();
    }
    if (typeof updates.flavours === 'string') {
      updates.flavours = updates.flavours.split(',').map((f: string) => f.trim()).filter(Boolean);
    }

    const updated = await db.updateCake(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Cake model not found.' });
    }

    return res.json({
      success: true,
      message: `Cake "${updated.name}" updated successfully.`,
      cake: updated,
    });
  } catch (err: any) {
    console.error('[API] Error updating cake:', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cakes/:id - Delete cake model
apiRouter.delete('/cakes/:id', async (req: Request, res: Response) => {
  try {
    const success = await db.deleteCake(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Cake model not found.' });
    }
    return res.json({ success: true, message: 'Cake model permanently removed.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/upload - Cake image upload handler
apiRouter.post('/upload', async (req: Request, res: Response) => {
  try {
    const { filename, dataUrl } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'Image data URL is required.' });
    }

    // Match data:image/png;base64,...
    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image data URL format.' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';

    const safeName = (filename || 'cake-photo')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    const finalFilename = `${Date.now()}-${safeName}.${extension}`;

    const fs = await import('node:fs');
    const path = await import('node:path');
    const uploadsDir = path.resolve(process.cwd(), '.data', 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, finalFilename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const publicUrl = `/uploads/${finalFilename}`;
    return res.json({
      success: true,
      url: publicUrl,
      filename: finalFilename,
    });
  } catch (err: any) {
    console.error('[API] Image upload error:', err);
    return res.status(500).json({ error: 'Failed to process image upload: ' + err.message });
  }
});

