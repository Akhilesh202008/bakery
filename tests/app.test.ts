import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { db } from '../src/server/db.js';
import {
  normalizePhoneNumber,
  buildClickToChatUrl,
  verifyMetaSignature,
  getWhatsAppConfig,
} from '../src/server/whatsapp.js';

test('Phone number normalization for international WhatsApp format', () => {
  assert.equal(normalizePhoneNumber('8056702505'), '918056702505');
  assert.equal(normalizePhoneNumber('+91 8056702505'), '918056702505');
  assert.equal(normalizePhoneNumber('7401039450'), '917401039450');
  assert.equal(normalizePhoneNumber('+1 (555) 019-2834'), '15550192834');
});

test('Click-to-chat URL generation with prefilled inquiry message', () => {
  const url = buildClickToChatUrl('8056702505', 'Hello Artisanal Patisserie! Ref: AP-2026-1234');
  assert.ok(url.startsWith('https://wa.me/918056702505?text='));
  assert.ok(url.includes('AP-2026-1234'));
});

test('Database Inquiry creation and retrieval', async () => {
  const inq = await db.createInquiry({
    clientName: 'Test Client',
    phone: '918056702505',
    email: 'test@example.com',
    occasion: 'Wedding Reception',
    flavourProfile: 'Valrhona 70% Dark Truffle',
    guestCount: '35-50 guests (2-Tier Grande)',
    eventDate: '2026-11-20',
    designNotes: 'Edible gold leaf accents',
  });

  assert.ok(inq.id);
  assert.ok(inq.referenceCode.startsWith('AP-'));
  assert.equal(inq.clientName, 'Test Client');
  assert.equal(inq.status, 'NEW');

  // Verify retrieval
  const retrieved = await db.getInquiryById(inq.id);
  assert.ok(retrieved);
  assert.equal(retrieved?.referenceCode, inq.referenceCode);

  // Verify status update
  const updated = await db.updateInquiry(inq.id, {
    status: 'CONFIRMED',
    internalNotes: 'Tasting scheduled',
    estimatedPrice: 280,
  });
  assert.equal(updated?.status, 'CONFIRMED');
  assert.equal(updated?.estimatedPrice, 280);
});

test('Meta Webhook Signature Verification logic', () => {
  const payload = JSON.stringify({ object: 'whatsapp_business_account' });
  const appSecret = 'test_secret_key_123';
  
  // Create expected signature
  const hmac = crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
  const validHeader = `sha256=${hmac}`;
  const invalidHeader = `sha256=invalidhash12345`;

  assert.equal(verifyMetaSignature(payload, validHeader, appSecret), true);
  assert.equal(verifyMetaSignature(payload, invalidHeader, appSecret), false);
});

test('Message log recording and retrieval', async () => {
  const log = await db.logMessage({
    direction: 'OUTBOUND',
    channel: 'WHATSAPP_CLOUD_API',
    recipientPhone: '918056702505',
    messageContent: 'Test outbound notification',
    status: 'SENT',
    metaMessageId: 'wamid.test.12345',
  });

  assert.ok(log.id);
  assert.equal(log.status, 'SENT');

  const logs = await db.getMessageLogs(10);
  assert.ok(logs.length > 0);
  assert.ok(logs.some((l) => l.metaMessageId === 'wamid.test.12345'));
});

test('Dynamic Cake Model Management - Creation, Retrieval, Updates, and Deletion', async () => {
  // 1. Create a brand new cake model
  const newCake = await db.createCake({
    name: 'Pistachio Rose Choux Gateau',
    description: 'Crisp choux pastry layered with Sicilian pistachio mousseline and Persian rose glaze.',
    category: 'entremets',
    tag: 'Chef Highlight',
    tagType: 'signature',
    startingPrice: 85,
    sizePriceNote: 'Serves 8-10 · From $85',
    sizes: [
      { size: '7-inch Gateau', servings: '8-10 guests', price: 85 },
      { size: '9-inch Gateau', servings: '14-16 guests', price: 115 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
    flavours: ['Sicilian Pistachio', 'Persian Rosewater', 'Chantilly Cream'],
    isEggless: true,
    dietaryNote: '100% Eggless Recipe',
    isAvailable: true,
    isFeatured: true,
    leadTimeHours: 48,
    customizations: 'Pistachio praline crunch, dried organic rose petals',
  });

  assert.ok(newCake.id);
  assert.equal(newCake.name, 'Pistachio Rose Choux Gateau');
  assert.equal(newCake.isEggless, true);
  assert.equal(newCake.startingPrice, 85);

  // 2. Retrieve cake by ID
  const retrieved = await db.getCakeById(newCake.id);
  assert.ok(retrieved);
  assert.equal(retrieved?.name, 'Pistachio Rose Choux Gateau');

  // 3. Test category & eggless filtering
  const entremetsCakes = await db.getCakes({ category: 'entremets' });
  assert.ok(entremetsCakes.some((c) => c.id === newCake.id));

  const egglessCakes = await db.getCakes({ egglessOnly: true });
  assert.ok(egglessCakes.some((c) => c.id === newCake.id));

  // 4. Update availability and price
  const updated = await db.updateCake(newCake.id, {
    isAvailable: false,
    startingPrice: 95,
  });
  assert.equal(updated?.isAvailable, false);
  assert.equal(updated?.startingPrice, 95);

  // 5. Delete the cake model
  const deleted = await db.deleteCake(newCake.id);
  assert.equal(deleted, true);

  // Verify it is no longer returned
  const afterDelete = await db.getCakeById(newCake.id);
  assert.equal(afterDelete, null);
});

