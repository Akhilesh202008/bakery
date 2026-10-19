# Artisanal Patisserie — Full-Stack Web Application

A production-ready bespoke patisserie web platform preserving the luxury Google Stitch UI, featuring an Express & TypeScript backend, PostgreSQL database persistence (with Prisma schema & migrations), and official Meta WhatsApp Business Cloud API + click-to-chat integrations.

---

## 1. Business Contact Numbers

- **Primary Order Desk:** `8056702505` (`+91 8056702505`)
- **Secondary Concierge Line:** `7401039450` (`+91 7401039450`)
- **Boutique Flagship:** `+1 (555) 019-2834`
- **WhatsApp Official Click-to-Chat Format:**
  - Primary: `https://wa.me/918056702505`
  - Secondary: `https://wa.me/917401039450`

---

## 2. Key Features

1. **Faithful Stitch UI & Sensory Editorial Design:**
   - Parisian luxury confectionery aesthetic: Ganache (`#4A2E2B`), Rose Glaze (`#E8B4B8`), Brushed Gold (`#C5A059`), Chantilly Cream (`#FDFBF7`).
   - High-contrast typography pairing **Playfair Display** editorial serif with **Plus Jakarta Sans** humanist sans-serif.
   - Vitrine Showcase with category filtering (*All Creations*, *Decadent Chocolate*, *Celebration Classics*, *Bridal & Elegance*, *French Entremets*).
   - Craftsmanship pillars and Parisian baking heritage story.
   - Interactive Atelier map with address copy and navigation links.

2. **Dynamic Cake Model Management:**
   - Owner/Admin can add new cake models at any time with photo upload and live preview.
   - Configure starting prices, multiple size tiers with portion servings and pricing, flavour options, eggless options, advance notice hours, and custom accents.
   - Toggle in-stock / out-of-stock availability directly from the admin panel.
   - Changes persist permanently to PostgreSQL and automatically update the customer-facing boutique vitrine in real time.
   - Interactive Customer Product Modal with size tier selection, flavour choice, custom plaque inscription, and direct WhatsApp order generation.

3. **Custom Cake Enquiry Studio:**
   - Full client validation with occasion, flavor profile, guest count, and event date (minimum 5–7 days advance notice).
   - Generates unique reference codes (e.g., `AP-2026-9284`).
   - Automatically stores inquiries in PostgreSQL with customer profile deduplication.
   - Immediate confirmation dialog with 1-click WhatsApp button pre-filled with the inquiry dossier.

4. **Official Meta WhatsApp Business Cloud API & Webhooks:**
   - `GET /api/webhooks/whatsapp`: Webhook verification with `hub.mode`, `hub.verify_token`, and `hub.challenge`.
   - `POST /api/webhooks/whatsapp`: Receives incoming WhatsApp messages and delivery/read receipts with HMAC-SHA256 signature verification.
   - `POST /api/whatsapp/send-message`: Sends real-time messages via Graph API `v21.0` and logs to PostgreSQL.
   - Built-in simulation tool in the admin panel to test webhook ingestion in development without waiting for Meta approvals.

5. **Atelier Concierge & Admin CRM:**
   - Access via the shield icon in the top header.
   - Complete Cake Management panel: search, category filters, edit, availability toggle, and delete.
   - Search inquiries by client name, reference code, phone number, or occasion.
   - Filter inquiries by status (`NEW`, `CONTACTED`, `QUOTED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
   - Update inquiry quotes, internal chef notes, and celebration status.
   - One-click customer WhatsApp reply pre-filled with the inquiry context.
   - Full message and webhook audit logs viewer.

---

## 3. Database Architecture (PostgreSQL)

### Tables & Models:
- **`cakes`**: Stores all published cake models, categories, pricing tiers (`JSONB`), photos, flavours, eggless status, and availability.
- **`inquiries`**: Stores bespoke cake inquiries, event dates, guest counts, flavors, references, statuses, and notes.
- **`customer_profiles`**: Tracks customer records, total order counts, and inquiry history by phone number.
- **`message_logs`**: Audits all outbound and inbound WhatsApp messages, wamids, and statuses (`SENT`, `DELIVERED`, `READ`, `FAILED`).
- **`users`**: Administrator and pastry chef credentials.
- **`audit_logs`**: Immutable history of status modifications and concierge actions.

### Schema & Migrations:
- **Prisma Schema:** `prisma/schema.prisma`
- **SQL Initializations:** `prisma/migrations/01_init.sql` & `prisma/migrations/02_cakes.sql`

To apply migrations to your managed PostgreSQL database:
```bash
# Using Prisma
npx prisma migrate deploy

# Or using raw SQL client (psql)
psql "$DATABASE_URL" -f prisma/migrations/01_init.sql
```

---

## 4. Environment Variables (`.env`)

Configure the following in your `.env` file (see `.env.example`):

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Web server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/artisanal_patisserie` |
| `PRIMARY_CONTACT_PHONE` | Primary order contact phone | `8056702505` |
| `SECONDARY_CONTACT_PHONE` | Secondary concierge phone | `7401039450` |
| `WHATSAPP_PHONE_NUMBER` | Configured WhatsApp number (international) | `918056702505` |
| `WHATSAPP_ACCESS_TOKEN` | Meta System User Access Token | `EAA...` |
| `WHATSAPP_PHONE_NUMBER_ID`| Meta WhatsApp Phone Number ID | `100000000000000` |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Meta WhatsApp Business Account ID | `200000000000000` |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification token | `artisanal_patisserie_verify_token_secret` |
| `WHATSAPP_APP_SECRET` | Meta App Secret for HMAC verification | `YOUR_APP_SECRET` |
| `WHATSAPP_API_VERSION` | Meta Graph API Version | `v21.0` |

---

## 5. Local Setup & Execution

### Install Dependencies:
```bash
npm install
```

### Run Development Server:
```bash
npm run dev
```
The application will be live at `http://localhost:3000`.

### Run Automated Tests:
```bash
npm test
```

### Production Build:
```bash
npm run build
npm start
```

---

## 6. Official WhatsApp Business Platform Cloud API Setup

1. **Register with Meta for Developers:**
   - Go to [developers.facebook.com](https://developers.facebook.com).
   - Create a Business App and select **WhatsApp**.
2. **Retrieve API Credentials:**
   - Navigate to **WhatsApp > API Setup**.
   - Copy your **Temporary Access Token** (or generate a permanent **System User Token** in Meta Business Manager).
   - Note the **Phone Number ID** and **WhatsApp Business Account ID**.
3. **Configure Webhook in Meta Portal:**
   - In Meta Dashboard, go to **WhatsApp > Configuration**.
   - Set **Callback URL** to: `https://YOUR_DOMAIN/api/webhooks/whatsapp`
   - Set **Verify Token** to: `artisanal_patisserie_verify_token_secret` (or value matching `WHATSAPP_VERIFY_TOKEN`).
   - Subscribe to the `messages` webhook field.
4. **Approve Message Templates:**
   - Under **WhatsApp > Message Templates**, submit templates for business-initiated notifications.
