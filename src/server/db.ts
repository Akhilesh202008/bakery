import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'ADMIN' | 'PASTRY_CHEF' | 'CONCIERGE';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  totalInquiries: number;
  lastInquiryAt: string;
  createdAt: string;
  updatedAt: string;
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

export interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  performedBy?: string;
  details?: string;
  createdAt: string;
}

export interface CakeSizeTier {
  size: string;
  servings: string;
  price: number;
}

export interface Cake {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tag?: string;
  tagType?: 'bestseller' | 'signature' | 'consultation' | 'gift' | 'new';
  startingPrice: number;
  sizePriceNote?: string;
  sizes?: CakeSizeTier[];
  imageUrl: string;
  altText?: string;
  flavours: string[];
  isEggless: boolean;
  dietaryNote?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  leadTimeHours: number;
  customizations?: string;
  createdAt: string;
  updatedAt: string;
}

interface LocalDatabaseState {
  users: User[];
  customerProfiles: CustomerProfile[];
  inquiries: Inquiry[];
  messageLogs: MessageLog[];
  auditLogs: AuditLog[];
  cakes: Cake[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class DatabaseService {
  private pgPool: pg.Pool | null = null;
  private isPostgresAvailable = false;
  private localState: LocalDatabaseState = {
    users: [],
    customerProfiles: [],
    inquiries: [],
    messageLogs: [],
    auditLogs: [],
    cakes: [],
  };

  constructor() {
    this.initLocalStore();
    this.tryInitPostgres();
  }

  private initLocalStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.localState = JSON.parse(raw);
        if (!this.localState.cakes || this.localState.cakes.length === 0) {
          this.localState.cakes = this.getDefaultCakes();
          this.persistLocalStore();
        }
      } else {
        this.seedInitialData();
        this.persistLocalStore();
      }
    } catch (err) {
      console.error('[DB] Error loading local persistent store:', err);
      this.seedInitialData();
    }
  }

  private persistLocalStore() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.localState, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save local DB:', err);
    }
  }

  public getDefaultCakes(): Cake[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'cake-valrhona-fudge',
        name: 'Noir Valrhona Fudge Torte',
        slug: 'noir-valrhona-fudge-torte',
        category: 'chocolate',
        tag: 'Bestseller',
        tagType: 'bestseller',
        description: 'Layers of 70% dark chocolate sponge, silky cocoa ganache, chocolate curls, and 24k edible gold dust.',
        startingPrice: 68,
        sizePriceNote: 'Sizes: 6-inch (8-10) | 8-inch (14-16) · From $68',
        sizes: [
          { size: '6-inch Round', servings: '8-10 guests', price: 68 },
          { size: '8-inch Round', servings: '14-16 guests', price: 92 },
          { size: '10-inch Grande', servings: '20-25 guests', price: 125 },
        ],
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVwjGBik0CytnEyWI4BjlyIapeQH_qjwR1XrjPUCSRsbypkWnrxRzdRSYJrEWIzc_c8tWgQ8wc2FFpfL4wQtuJXNeLHhyVdkW5q3CGze26-X9pI6PnJ82WJe4cYAAJJsTCYZtWzYUTJTbPbAQOhgsotBmfEbp8hQJ2QGW6ZZQjiuo8KCI7Z_oH2LrmskfZRC8PJ0mioDaj6y3YihaDrzGSqfBPBb_uCkRvkuryMwQrTEODYigfIGfKpg',
        altText: 'Noir Valrhona Fudge Torte slice with edible gold',
        flavours: ['Valrhona 70% Dark Truffle', 'Dark Chocolate Ganache', 'Sea Salt Caramel Infusion'],
        isEggless: true,
        dietaryNote: '100% Eggless Option Available',
        isAvailable: true,
        isFeatured: true,
        leadTimeHours: 48,
        customizations: '24k gold leaf inscription, dark chocolate curls, personalized birthday plaque',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cake-le-fraisier',
        name: 'Le Fraisier Classique',
        slug: 'le-fraisier-classique',
        category: 'classic',
        tag: "Chef's Signature",
        tagType: 'signature',
        description: 'Light genoise sponge soaked in wild berry syrup, layered with diplomat vanilla cream and sweet hand-picked strawberries.',
        startingPrice: 72,
        sizePriceNote: 'Sizes: 7-inch round (10-12 servings) · From $72',
        sizes: [
          { size: '7-inch Round', servings: '10-12 guests', price: 72 },
          { size: '9-inch Round', servings: '16-18 guests', price: 98 },
        ],
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm7lJ9zZVC4rBnCK4vAVRwB_nLKXB60Ac_eusAOXiqdgXqJifbOQMcIFptWYI1hjpjvTVpMBzIDd6-0SvsFPHlEA0vJO5lxHyS9mjdxir3nYZvfPfzBEn-21ji7Hn_laTCON3b0GlF2NjIYnXHEAgFTFa_kjT6gd-Ral_dX-Oo3EU9oToaaMbWmGGrFhpnUNsWGv06bp-9Xy61zjxOOfwHdSUh49SuiXsjQQ-4DSW-8SIFEhDnBSlCWw',
        altText: 'Le Fraisier Classique strawberry cake with diplomat cream',
        flavours: ['Madagascar Bourbon Vanilla', 'Wild Berry Coulis', 'Organic Strawberry Cream'],
        isEggless: false,
        dietaryNote: 'Contains Organic Free-Range Eggs',
        isAvailable: true,
        isFeatured: true,
        leadTimeHours: 48,
        customizations: 'Hand-piped buttercream flowers, seasonal berry ring, calligraphy banner',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cake-botanical-ivory',
        name: 'Botanical Ivory Wedding Cake',
        slug: 'botanical-ivory-wedding-cake',
        category: 'wedding',
        tag: 'Custom Consultation',
        tagType: 'consultation',
        description: 'Velvet ivory swiss meringue buttercream adorned with organic fresh orchids, peach garden roses, and delicate gold leaf.',
        startingPrice: 280,
        sizePriceNote: '2, 3 or 4 Tiers (30–120+ guests) · From $280',
        sizes: [
          { size: '2-Tier Compact', servings: '30-40 guests', price: 280 },
          { size: '3-Tier Grand', servings: '70-90 guests', price: 460 },
          { size: '4-Tier Masterpiece', servings: '120-150 guests', price: 680 },
        ],
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGUyBbEnk16qfz1K4NBWWSUTJPbJCzOjigS-Yh3xKXXQhx_BggaNMKnduS8tqbNowSO5U2enCQVeI3pfn7CrMd9Gf6coAGkwgDueq8QxDHfvUH9ucAl-on0LX3OnaT-Tk_PA5jPzLuaI5PvVTYzfpFjUfPqsDGL9tOf2OtqAxXObpmQ5WasOCftFDDsfntleIM2Y42LJzpjMQpPc0wsx0I-X7FFPqJMQun3OnPCaD7ZanywIjkboZh2g',
        altText: 'Botanical Ivory Tiered Wedding Cake with floral styling',
        flavours: ['Vanilla Bean & Rosewater', 'Lemon Curd & Lavender', 'Hazelnut Praline Croquant'],
        isEggless: true,
        dietaryNote: 'Eggless Option Available',
        isAvailable: true,
        isFeatured: true,
        leadTimeHours: 120,
        customizations: 'Fresh organic floral arrangements, edible gold foil accents, customized tier height',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cake-petite-entremets',
        name: 'Petite Entremets & Macarons',
        slug: 'petite-entremets-macarons',
        category: 'entremets',
        tag: 'Gift Box',
        tagType: 'gift',
        description: 'Assortment of handmade Parisian macarons (pistachio, salted caramel, blush raspberry) and glazed mini mousse entremets.',
        startingPrice: 42,
        sizePriceNote: 'Box of 12 or 24 Pieces · From $42',
        sizes: [
          { size: 'Luxury Gift Box (12 Pieces)', servings: '3-4 guests', price: 42 },
          { size: 'Grand Degustation Box (24 Pieces)', servings: '6-8 guests', price: 76 },
        ],
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzZl9MWWDS9WLsbwtdZPC9os-0-HqWftffxWvA9f_gPZcxxOeOlHwNYefr0BICrpKNfBCKw_W9rZflGeJWfaKMkqWcjZhG_xIwt0k-8lTqABbiiGmxyOd4lu-hxJ9IbQ06eHx0WvBGmNrdecoJkdLDLjtpA6EJzdi7iGLq9dw6kSEAB6Cv304vZong7U7PwEWndxRmCpzMHhUzyWd6YgXEYmLSkapFypAsBrCJ84cWE_mAKDO9bszz0Q',
        altText: 'Petite Entremets and Parisian Macaron Box',
        flavours: ['Sicilian Pistachio', 'Fleur de Sel Caramel', 'Blush Raspberry Rose'],
        isEggless: false,
        dietaryNote: 'Gluten-conscious, Contains Almonds',
        isAvailable: true,
        isFeatured: false,
        leadTimeHours: 24,
        customizations: 'Boutique silk ribbon packaging, handwritten gift card',
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  private seedInitialData() {
    const now = new Date().toISOString();
    this.localState = {
      users: [
        {
          id: 'u-admin-1',
          email: 'atelier@artisanalpatisserie.com',
          name: 'Master Pâtissier',
          passwordHash: 'atelier2026',
          role: 'ADMIN',
          createdAt: now,
          updatedAt: now,
        },
      ],
      customerProfiles: [
        {
          id: 'cp-1',
          name: 'Lady Vivienne Sterling',
          phone: '8056702505',
          email: 'vivienne@sterlingevents.co',
          notes: 'VIP Client - Grand wedding celebration organizer',
          totalInquiries: 2,
          lastInquiryAt: now,
          createdAt: now,
          updatedAt: now,
        },
      ],
      inquiries: [
        {
          id: 'inq-sample-1',
          referenceCode: 'AP-2026-8812',
          clientName: 'Lady Vivienne Sterling',
          phone: '8056702505',
          email: 'vivienne@sterlingevents.co',
          occasion: 'Wedding Reception',
          flavourProfile: 'Valrhona 70% Dark Truffle',
          guestCount: '60-100+ guests (3 to 4-Tier Masterpiece)',
          eventDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          designNotes: 'Ivory swiss meringue with cascading blush garden roses and 24k gold leaf accents. White-glove delivery to West End Pavilion.',
          status: 'CONFIRMED',
          internalNotes: 'Tasting box delivered. Client approved tier composition on WhatsApp.',
          estimatedPrice: 380,
          whatsappSent: true,
          customerId: 'cp-1',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          updatedAt: now,
        },
        {
          id: 'inq-sample-2',
          referenceCode: 'AP-2026-9401',
          clientName: 'Alexander Hayes',
          phone: '7401039450',
          email: 'alex.hayes@outlook.com',
          occasion: 'Anniversary',
          flavourProfile: 'Madagascar Bourbon Vanilla & Wild Berries',
          guestCount: '20-30 guests (2-Tier Compact)',
          eventDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
          designNotes: 'Hand-lettered calligraphy inscription: "Forever & Always". Gluten-free layer requested.',
          status: 'NEW',
          internalNotes: 'Awaiting customer confirmation via WhatsApp.',
          estimatedPrice: 165,
          whatsappSent: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      messageLogs: [
        {
          id: 'msg-1',
          inquiryId: 'inq-sample-1',
          direction: 'OUTBOUND',
          channel: 'WHATSAPP_CLOUD_API',
          recipientPhone: '918056702505',
          senderPhone: '918056702505',
          messageContent: 'Bonjour Lady Vivienne Sterling! Your enquiry AP-2026-8812 has been received at Artisanal Patisserie. Our Chef will review your vision.',
          status: 'DELIVERED',
          metaMessageId: 'wamid.HBgMOTE4MDU2NzAyNTA1FQIAERgSMzc5QkI5QUUwNUExOTJEQ0E0AA==',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ],
      auditLogs: [
        {
          id: 'aud-1',
          entity: 'Inquiry',
          entityId: 'inq-sample-1',
          action: 'STATUS_UPDATED',
          performedBy: 'u-admin-1',
          details: 'Status updated from NEW to CONFIRMED',
          createdAt: now,
        },
      ],
      cakes: this.getDefaultCakes(),
    };
  }

  private async tryInitPostgres() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || (dbUrl.includes('localhost:5432/artisanal_patisserie?sslmode=prefer') && !process.env.PGHOST)) {
      console.log('[DB] Running with persistent store (.data/db.json). Ready to connect to PostgreSQL if DATABASE_URL is configured.');
      return;
    }

    try {
      this.pgPool = new pg.Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 5000,
      });

      const client = await this.pgPool.connect();
      console.log('[DB] Successfully connected to PostgreSQL instance!');
      
      // Auto-run table creation
      await client.query(`
        CREATE TABLE IF NOT EXISTS inquiries (
          id VARCHAR(36) PRIMARY KEY,
          reference_code VARCHAR(50) NOT NULL UNIQUE,
          client_name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          email VARCHAR(255),
          occasion VARCHAR(255) NOT NULL,
          flavour_profile VARCHAR(255) NOT NULL,
          guest_count VARCHAR(255) NOT NULL,
          event_date DATE NOT NULL,
          design_notes TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'NEW',
          internal_notes TEXT,
          estimated_price NUMERIC(10, 2),
          whatsapp_sent BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS cakes (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT NOT NULL,
          category VARCHAR(100) NOT NULL,
          tag VARCHAR(100),
          tag_type VARCHAR(50) DEFAULT 'bestseller',
          starting_price NUMERIC(10, 2) NOT NULL,
          size_price_note VARCHAR(255),
          sizes JSONB,
          image_url TEXT NOT NULL,
          alt_text VARCHAR(255),
          flavours TEXT[] DEFAULT '{}',
          is_eggless BOOLEAN NOT NULL DEFAULT false,
          dietary_note VARCHAR(100) DEFAULT 'Contains Eggs',
          is_available BOOLEAN NOT NULL DEFAULT true,
          is_featured BOOLEAN NOT NULL DEFAULT false,
          lead_time_hours INT NOT NULL DEFAULT 48,
          customizations TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS message_logs (
          id VARCHAR(36) PRIMARY KEY,
          inquiry_id VARCHAR(36),
          direction VARCHAR(20) NOT NULL DEFAULT 'OUTBOUND',
          channel VARCHAR(50) NOT NULL DEFAULT 'WHATSAPP_CLOUD_API',
          recipient_phone VARCHAR(50) NOT NULL,
          sender_phone VARCHAR(50),
          message_content TEXT NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'SENT',
          meta_message_id VARCHAR(255),
          error_payload TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      client.release();
      this.isPostgresAvailable = true;
    } catch (err: any) {
      console.warn('[DB] PostgreSQL connection attempt failed, maintaining persistent local store:', err.message);
      this.isPostgresAvailable = false;
    }
  }

  public getStatus() {
    return {
      connected: true,
      storageEngine: this.isPostgresAvailable ? 'PostgreSQL (Active connection pool)' : 'Persistent Storage Engine (.data/db.json)',
      totalInquiries: this.localState.inquiries.length,
      totalCakes: this.localState.cakes.length,
      totalMessages: this.localState.messageLogs.length,
    };
  }

  // --- Cakes Management ---
  public async getCakes(params?: {
    category?: string;
    availableOnly?: boolean;
    search?: string;
    egglessOnly?: boolean;
  }): Promise<Cake[]> {
    let list = [...this.localState.cakes];

    if (params?.availableOnly) {
      list = list.filter((c) => c.isAvailable);
    }

    if (params?.egglessOnly) {
      list = list.filter((c) => c.isEggless);
    }

    if (params?.category && params.category !== 'all') {
      const cat = params.category.toLowerCase().trim();
      list = list.filter((c) => c.category.toLowerCase() === cat);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.flavours.some((f) => f.toLowerCase().includes(q))
      );
    }

    return list;
  }

  public async getCakeById(id: string): Promise<Cake | null> {
    return this.localState.cakes.find((c) => c.id === id || c.slug === id) || null;
  }

  public async createCake(data: Omit<Cake, 'id' | 'createdAt' | 'updatedAt' | 'slug'> & { slug?: string }): Promise<Cake> {
    const id = 'cake-' + Math.random().toString(36).substring(2, 10);
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.substring(5, 9);
    const now = new Date().toISOString();

    const newCake: Cake = {
      id,
      name: data.name,
      slug,
      description: data.description,
      category: data.category || 'classic',
      tag: data.tag || 'New Arrival',
      tagType: data.tagType || 'new',
      startingPrice: Number(data.startingPrice),
      sizePriceNote: data.sizePriceNote || `From $${data.startingPrice}`,
      sizes: data.sizes || [
        { size: 'Standard (8-10 servings)', servings: '8-10 guests', price: Number(data.startingPrice) },
      ],
      imageUrl: data.imageUrl,
      altText: data.altText || data.name,
      flavours: Array.isArray(data.flavours) ? data.flavours : [data.flavours].filter(Boolean),
      isEggless: Boolean(data.isEggless),
      dietaryNote: data.dietaryNote || (data.isEggless ? '100% Eggless' : 'Contains Eggs'),
      isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
      isFeatured: Boolean(data.isFeatured),
      leadTimeHours: data.leadTimeHours ? Number(data.leadTimeHours) : 48,
      customizations: data.customizations || '',
      createdAt: now,
      updatedAt: now,
    };

    this.localState.cakes.unshift(newCake);

    this.localState.auditLogs.unshift({
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      entity: 'Cake',
      entityId: id,
      action: 'CAKE_CREATED',
      performedBy: 'Pastry Chef / Admin',
      details: `New cake model added: "${newCake.name}" ($${newCake.startingPrice})`,
      createdAt: now,
    });

    this.persistLocalStore();

    if (this.isPostgresAvailable && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO cakes (id, name, slug, description, category, tag, tag_type, starting_price, size_price_note, sizes, image_url, alt_text, flavours, is_eggless, dietary_note, is_available, is_featured, lead_time_hours, customizations)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
          [
            newCake.id,
            newCake.name,
            newCake.slug,
            newCake.description,
            newCake.category,
            newCake.tag || null,
            newCake.tagType || 'new',
            newCake.startingPrice,
            newCake.sizePriceNote || null,
            JSON.stringify(newCake.sizes || []),
            newCake.imageUrl,
            newCake.altText || null,
            newCake.flavours,
            newCake.isEggless,
            newCake.dietaryNote || null,
            newCake.isAvailable,
            newCake.isFeatured,
            newCake.leadTimeHours,
            newCake.customizations || null,
          ]
        );
      } catch (err) {
        console.error('[DB] Postgres insert cake error:', err);
      }
    }

    return newCake;
  }

  public async updateCake(id: string, updates: Partial<Cake>): Promise<Cake | null> {
    const cake = this.localState.cakes.find((c) => c.id === id);
    if (!cake) return null;

    Object.assign(cake, updates, { updatedAt: new Date().toISOString() });

    this.localState.auditLogs.unshift({
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      entity: 'Cake',
      entityId: id,
      action: 'CAKE_UPDATED',
      performedBy: 'Pastry Chef / Admin',
      details: `Cake "${cake.name}" updated: ${Object.keys(updates).join(', ')}`,
      createdAt: new Date().toISOString(),
    });

    this.persistLocalStore();

    if (this.isPostgresAvailable && this.pgPool) {
      try {
        await this.pgPool.query(
          `UPDATE cakes SET name = $1, description = $2, category = $3, starting_price = $4, is_available = $5, is_featured = $6, image_url = $7, updated_at = NOW() WHERE id = $8`,
          [cake.name, cake.description, cake.category, cake.startingPrice, cake.isAvailable, cake.isFeatured, cake.imageUrl, id]
        );
      } catch (err) {
        console.error('[DB] Postgres update cake error:', err);
      }
    }

    return cake;
  }

  public async deleteCake(id: string): Promise<boolean> {
    const idx = this.localState.cakes.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    const removed = this.localState.cakes[idx];
    this.localState.cakes.splice(idx, 1);

    this.localState.auditLogs.unshift({
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      entity: 'Cake',
      entityId: id,
      action: 'CAKE_DELETED',
      performedBy: 'Pastry Chef / Admin',
      details: `Cake "${removed.name}" permanently deleted`,
      createdAt: new Date().toISOString(),
    });

    this.persistLocalStore();

    if (this.isPostgresAvailable && this.pgPool) {
      try {
        await this.pgPool.query(`DELETE FROM cakes WHERE id = $1`, [id]);
      } catch (err) {
        console.error('[DB] Postgres delete cake error:', err);
      }
    }

    return true;
  }

  // --- Inquiries ---
  public async createInquiry(data: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt' | 'referenceCode' | 'status' | 'whatsappSent'> & { referenceCode?: string; whatsappSent?: boolean }): Promise<Inquiry> {
    const id = 'inq-' + Math.random().toString(36).substring(2, 10);
    const code = data.referenceCode || `AP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newInquiry: Inquiry = {
      id,
      referenceCode: code,
      clientName: data.clientName,
      phone: data.phone,
      email: data.email,
      occasion: data.occasion,
      flavourProfile: data.flavourProfile,
      guestCount: data.guestCount,
      eventDate: data.eventDate,
      designNotes: data.designNotes || '',
      status: 'NEW',
      internalNotes: data.internalNotes || '',
      estimatedPrice: data.estimatedPrice,
      whatsappSent: data.whatsappSent || false,
      customerId: data.customerId,
      createdAt: now,
      updatedAt: now,
    };

    this.localState.inquiries.unshift(newInquiry);
    
    let cust = this.localState.customerProfiles.find((c) => c.phone === data.phone);
    if (cust) {
      cust.totalInquiries += 1;
      cust.lastInquiryAt = now;
      cust.updatedAt = now;
      newInquiry.customerId = cust.id;
    } else {
      const custId = 'cp-' + Math.random().toString(36).substring(2, 8);
      this.localState.customerProfiles.push({
        id: custId,
        name: data.clientName,
        phone: data.phone,
        email: data.email,
        totalInquiries: 1,
        lastInquiryAt: now,
        createdAt: now,
        updatedAt: now,
      });
      newInquiry.customerId = custId;
    }

    this.localState.auditLogs.unshift({
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      entity: 'Inquiry',
      entityId: id,
      action: 'CREATED',
      performedBy: 'Client Website Submission',
      details: `New enquiry created for ${data.clientName} (${code})`,
      createdAt: now,
    });

    this.persistLocalStore();

    if (this.isPostgresAvailable && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO inquiries (id, reference_code, client_name, phone, email, occasion, flavour_profile, guest_count, event_date, design_notes, status, whatsapp_sent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            newInquiry.id,
            newInquiry.referenceCode,
            newInquiry.clientName,
            newInquiry.phone,
            newInquiry.email || null,
            newInquiry.occasion,
            newInquiry.flavourProfile,
            newInquiry.guestCount,
            newInquiry.eventDate,
            newInquiry.designNotes || null,
            newInquiry.status,
            newInquiry.whatsappSent,
          ]
        );
      } catch (err) {
        console.error('[DB] Postgres insert error:', err);
      }
    }

    return newInquiry;
  }

  public async getInquiries(params?: { search?: string; status?: string }): Promise<Inquiry[]> {
    let list = [...this.localState.inquiries];

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((i) => i.status.toUpperCase() === params.status?.toUpperCase());
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.referenceCode.toLowerCase().includes(q) ||
          i.clientName.toLowerCase().includes(q) ||
          i.phone.toLowerCase().includes(q) ||
          i.occasion.toLowerCase().includes(q) ||
          i.flavourProfile.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public async getInquiryById(id: string): Promise<Inquiry | null> {
    return this.localState.inquiries.find((i) => i.id === id || i.referenceCode === id) || null;
  }

  public async updateInquiry(id: string, updates: Partial<Inquiry>): Promise<Inquiry | null> {
    const inq = this.localState.inquiries.find((i) => i.id === id);
    if (!inq) return null;

    Object.assign(inq, updates, { updatedAt: new Date().toISOString() });

    this.localState.auditLogs.unshift({
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      entity: 'Inquiry',
      entityId: id,
      action: 'UPDATED',
      performedBy: 'Admin / Pastry Chef',
      details: `Inquiry ${inq.referenceCode} updated with: ${Object.keys(updates).join(', ')}`,
      createdAt: new Date().toISOString(),
    });

    this.persistLocalStore();

    if (this.isPostgresAvailable && this.pgPool) {
      try {
        await this.pgPool.query(
          `UPDATE inquiries SET status = $1, internal_notes = $2, estimated_price = $3, updated_at = NOW() WHERE id = $4`,
          [inq.status, inq.internalNotes || null, inq.estimatedPrice || null, id]
        );
      } catch (err) {
        console.error('[DB] Postgres update error:', err);
      }
    }

    return inq;
  }

  public async deleteInquiry(id: string): Promise<boolean> {
    const idx = this.localState.inquiries.findIndex((i) => i.id === id);
    if (idx === -1) return false;

    this.localState.inquiries.splice(idx, 1);
    this.persistLocalStore();

    if (this.isPostgresAvailable && this.pgPool) {
      try {
        await this.pgPool.query(`DELETE FROM inquiries WHERE id = $1`, [id]);
      } catch (err) {
        console.error('[DB] Postgres delete error:', err);
      }
    }

    return true;
  }

  // --- Message Logs ---
  public async logMessage(log: Omit<MessageLog, 'id' | 'createdAt'>): Promise<MessageLog> {
    const id = 'msg-' + Math.random().toString(36).substring(2, 10);
    const newLog: MessageLog = {
      id,
      ...log,
      createdAt: new Date().toISOString(),
    };
    this.localState.messageLogs.unshift(newLog);
    this.persistLocalStore();

    if (this.isPostgresAvailable && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO message_logs (id, inquiry_id, direction, channel, recipient_phone, sender_phone, message_content, status, meta_message_id, error_payload)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            id,
            log.inquiryId || null,
            log.direction,
            log.channel,
            log.recipientPhone,
            log.senderPhone || null,
            log.messageContent,
            log.status,
            log.metaMessageId || null,
            log.errorPayload || null,
          ]
        );
      } catch (err) {
        console.error('[DB] Postgres message log error:', err);
      }
    }

    return newLog;
  }

  public async getMessageLogs(limit = 50): Promise<MessageLog[]> {
    return this.localState.messageLogs.slice(0, limit);
  }

  public async getAuditLogs(limit = 50): Promise<AuditLog[]> {
    return this.localState.auditLogs.slice(0, limit);
  }
}

export const db = new DatabaseService();
