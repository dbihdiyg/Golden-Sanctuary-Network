# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

### קהילת הבוגרים Website

- Standalone React/Vite web artifact at `artifacts/alumni-community` served from `/`.
- Hebrew RTL single-page alumni community website with dark luxury spiritual styling.
- Includes cinematic hero, latest updates, masonry-style gallery with lightbox, video cards, downloadable PDF library, community feed, and footer.
- April 2026 brand upgrade: integrated the attached "מאירים" logo and shifted the visual palette to logo-inspired black/graphite, luminous gold, and deep royal blue.
- Expanded into a multi-page community hub with sticky navigation, floating WhatsApp/Ask Rabbi/join actions, homepage category cards, quick actions, media spotlight, and dedicated pages for photos, videos, PDFs, updates, Ask the Rabbi, contact, join updates, alumni stories, and events.
- Premium visual upgrade (April 2026): scroll-reveal animations (.sr/.sr-visible system), gold shimmer text, improved section headers with ornament dividers, active nav link indicator, upgraded Footer (4-column + social links), dramatic Inspiration quote section, animated timeline in CommunityFeed, number badges on PDFLibrary, upgraded Gallery with prev/next lightbox, and comprehensive hover states with gold glow across all cards.

### Authentication System (Clerk)
- Clerk auth provisioned (dev instance). Keys: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`
- Sign-in page at `/sign-in`, sign-up at `/sign-up`
- "כניסה" button in navbar (desktop + mobile)
- User portal at `/portal` (community board + my questions) — requires auth
- Admin panel at `/admin` — requires auth; admin user IDs set via `ADMIN_CLERK_USER_IDS` env var (comma-separated)
- Auth pane in workspace toolbar manages users, branding, and OAuth providers

### Community Board
- `/portal` — signed-in users can post messages, react with ❤️, delete own posts
- Posts stored in `community_posts` PostgreSQL table
- Reactions stored in `post_reactions` table (one per user per post)

### Ask Rabbi + Database
- `/ask-rabbi` form saves questions to `rabbi_questions` table + sends email via Gmail SMTP
- Admin panel shows all questions with status management (new → in_progress → answered)
- `rabbi_questions` status tracked in DB; admin can update via PATCH /api/admin/questions/:id
- `contact_submissions` table for contact form submissions (future use)

### YouTube Auto-fetch
- API endpoint `/api/youtube` fetches 15 latest videos from channel `UCdDqqlcExi8gVxHMI4mKpSA` via RSS
- Categorizes by title keywords, 10-minute cache
- Shorts: YyjYaoD_eeM, dw-0tv1JCDY, WJR3UNFD-AA, jtECZkvt_WY, fa2zbBBpJto

### Email
- GMAIL_USER: O462272103@gmail.com
- GMAIL_APP_PASSWORD: Google App Password (16-char, requires 2FA)
- Status: may need re-verification

### Contact Info
- Email: O462272103@GMAIL.COM
- Phone: 03-306-5092
- Address: מגדל העמק

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM + raw `pool.query` for new tables
- **Auth**: Clerk (@clerk/react v6, @clerk/express v2)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Database Tables

- `community_posts` — user posts on the community board
- `post_reactions` — emoji reactions (one per user per post)
- `rabbi_questions` — questions submitted via the ask-rabbi form
- `contact_submissions` — contact form submissions

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

---

## הדר — Design Template Marketplace (`artifacts/design-templates`)

- Separate React + Vite artifact at `/design-templates/`
- Hebrew RTL, navy/gold/cream aesthetic (#0B1833, #D6A84F, #F8F1E3)
- Fonts: HEBREW_FONTS array in `src/lib/fonts.ts` (16 fonts incl. Frank Ruhl Libre, Noto Serif Hebrew, etc.)
- Full-stack: React/Vite frontend + Express API server

### Pages
- `/` — Home: hero, template gallery (12 cards), process steps, 24h promise module, testimonials
- `/template/:id` — Template detail page
- `/order` — Order form with AI-powered text generation (calls `/hadar/ai-text` on API server)
- `/help` — Static guide page with 6 guide cards
- `/admin` — Password-protected admin panel (password: `hadar2026`); shows orders, templates, stats

### Features
- Dark/light mode (useTheme hook, localStorage)
- Multi-language Hebrew/English toggle (LangContext + i18n.ts)
- Social sharing on template cards (WhatsApp + copy link)
- Parallax mouse effect in hero section
- Floating chat widget with FAQ chips and WhatsApp redirect
- SEO meta tags in index.html

### AI Text Generation
- API route: `POST /hadar/ai-text` in api-server
- Requires: `OPENAI_API_KEY` env var
- Generates Hebrew ceremonial invitation text via GPT-4o-mini
- Used in order form with one-click generation

### Auth (Clerk) — הדר
- ClerkProvider wraps the entire הדר app
- Sign-in: `/design-templates/sign-in` — branded with gold theme, הדר logo header
- Sign-up: `/design-templates/sign-up` — same branding
- Home page nav: "כניסה" button for guests, UserButton + "העיצובים שלי" for signed-in users

### Template Loading (editor.tsx)
- Editor fetches all templates from `/api/hadar/public-templates` API on mount (no static data)
- Finds template by matching numeric DB ID (`String(t.id) === id`) OR by slug (for backward compat)
- Maps DB fields: `displayImageUrl || imageUrl` → `image` (editor background), `isGradient` computed from URL pattern
- Shows loading spinner while fetching, "not found" page if template missing
- Template type: `Template | null | "loading"` state guards prevent premature renders
- Slot default values are re-initialized when template loads (fresh sessions without a designId)

### User Flow (Login → Edit → Pay → Download)
1. User browses gallery → clicks "ערוך" on a template card (sends numeric DB id as URL param)
2. Editor fetches template from API, shows loading spinner, then renders with correct background image and slots
3. Editor shows auth wall overlay on preview — "נדרשת כניסה לחשבון"
4. User signs in/up → returns to editor (auth wall disappears)
5. User edits text fields and can save drafts
6. Clicks "קבלת העיצוב הסופי — ₪49" → PaymentWall modal opens; console log `[HADAR] opening payment wall`
7. Modal confirms price → calls `handlePay` → creates Stripe Checkout session; console log `[HADAR] starting checkout`
8. After Stripe payment → returns to editor with `?payment=success&session_id=...`
9. Editor calls `/api/hadar/checkout/verify` → sets `paySuccess=true`
10. Download button appears: "הורדת העיצוב (PNG איכות גבוהה)" — calls `handleDownload`; console log `[HADAR] starting download`
11. WhatsApp link also shown for studio contact

### My Designs Portal
- `/design-templates/my-designs` — shows all saved designs for signed-in users
- Cards show template preview, status badge (draft/paid/submitted), date
- Edit, delete, and "לתשלום" CTA per card
- Redirects to sign-in if not authenticated

### Stripe Integration
- Stripe connector: `connector:ccfg_stripe_01K611P4YQR0SZM11XFRQJC44Y` (connected as sandbox)
- `stripeClient.ts` in api-server — fetches credentials from Replit Connectors API
- `POST /api/hadar/checkout` — creates Stripe Checkout session (mode: payment, ₪49)
- `GET /api/hadar/checkout/verify?session_id=...` — verifies payment after return
- `POST /api/hadar/webhook` — Stripe webhook handler (registered BEFORE express.json())

### Saved Designs API (auth required)
- `GET /api/hadar/designs` — list user's designs
- `POST /api/hadar/designs` — create new design draft
- `PATCH /api/hadar/designs/:id` — update design fields
- `DELETE /api/hadar/designs/:id` — delete design

### Admin Template Editor (Rich Design Tools)
- `/admin` — password-protected admin panel (ADMIN_PASSWORD env var → ADMIN_SECRET token)
- Full visual slot editor with live text preview on canvas

**Canvas (stable, aspect-ratio locked):**
- Fixed `aspectRatio` from template dimensions (width/height), max-width 520px — matches user editor exactly
- Background image: `position: absolute, objectFit: contain` — never distorts
- Slot overlays: `left: x%, top: y%, transform: translateX(-50%)` — center-anchor convention matching user editor
- Font sizes/colors/gradients/3D effects all rendered identically to user editor via `buildAdminSlotCSS` / `buildAdminWrapperCSS`

**Layers Panel:**
- Every slot shown as a named layer row
- Eye icon (👁) — show/hide slot on canvas; saves `visible` field
- Lock icon (🔒) — prevents dragging on canvas; saves `locked` field
- ↑ ↓ arrows — reorder layer z-order
- Copy button — duplicates slot with "(עותק)" label
- Delete button — removes slot
- Layers sorted by z-index descending (highest layer at top)

**Save States:**
- Button shows "שומר..." (Loader spinner) while saving
- On success: turns green, shows "נשמר ✓", resets after 3s
- On error: turns red, shows error message

**Coordinate Convention (center-anchor):**
- `slot.x` = center X% of slot (matches `left: x%; transform: translateX(-50%)` in user editor)
- `slot.y` = top Y% of slot
- Both admin and user editor use same convention → positions match exactly

**Typography**: full Hebrew font picker (16 fonts via HEBREW_FONTS + custom DB fonts), exact px font size slider (8–120px), bold/italic/underline toggles
**Color**: hex color picker + 12 presets (gold, cream, white, navy, etc.)
**Spacing**: letter-spacing slider (-10–30px), line-height slider (0.6–4.0)
**Behavior**: multiline toggle, `fixed` toggle (locks slot for customers)
- Google Fonts loaded dynamically when font family changes in admin

**User Editor Sync:**
- When user opens a fresh template (no saved design), `slotStyles` initialized from template slot data
- This carries over admin-set font, color, gradients, 3D effects, positions to user editor
- Saved designs always load their own `__slotStyles` override (unchanged)

### Customer Text Effects (SlotStylePanel) — Advanced
`SlotStyle` interface in `src/components/SlotStylePanel.tsx`. Applied in `buildSlotCSS` / `buildSlotWrapperCSS` in editor.tsx.

**Sections (collapsible UI):**
1. **גופן ואותיות** — fontFamily, fontSize, color, bold/italic/underline
2. **ריווח ומיקום** — letterSpacing, lineHeight, opacity, rotation (±180°), skewX/Y (±45°)
3. **צל ועומק** — shadow (X/Y/blur/color), 3D Extrude (depth+angle+color), Long Shadow (length+angle+color)
4. **זוהר ואור** — glow (glowColor, glowRadius, glowIntensity 1–4 layers)
5. **גרדיאנט ומרקם** — gradient (from/to/angle) + 5 built-in textures: gold-foil, silver, fire, neon, rainbow
6. **קו ומסגרת** — stroke (color+width), Glass background (blur+color+borderRadius), Blend mode (multiply/screen/overlay/soft-light)
7. **עיקום טקסט** — warpType: none/arc-up/arc-down/arch/bulge/wave/circle; warpAmount 1–100

**Rendering:**
- Gradient/texture uses CSS `-webkit-background-clip: text` with `WebkitTextFillColor: transparent`
- All warps use `SvgWarpText` (Canvas-based pixel displacement engine, NOT SVG textPath).
  Approach: (1) render text horizontally on offscreen canvas with `ctx.direction="rtl"` for correct Hebrew;
  (2) apply per-column inverse displacement map to produce the curve. No per-glyph rotation.
- Shadow/glow/3D extrude/long-shadow all rendered via `text-shadow` chain built by `buildTextShadows()`
- Wrapper-level effects (rotation, skew, opacity, blend mode, glass) applied by `buildSlotWrapperCSS()`

### TextSlot / AdminSlot Architecture
- `TextSlot` (in `src/lib/data.ts`): shared interface used by editor renderer
- Key fields: `fontSizePx` (px, overrides old `fontSize` enum), `fontFamily` (full font name or "serif"/"sans"), `color` (hex or named), `opacity`, `letterSpacing`, `lineHeight`, `textShadow`, `zIndex`, `fixed`
- Backward compatible: old `fontSize` enum + named colors still work
- Slots stored as JSON in `hadar_templates.slots` column

### Support / Tickets System
- `/design-templates/support` — authenticated user can open, view, and reply to support tickets (chat-style WhatsApp-like UI)
- Ticket list shows status badges (פתוחה/בטיפול/סגורה), unread indicators, relative timestamps
- New ticket form: subject + message; quick-subject chips for common issues
- Chat view: 8-second polling for admin replies, Ctrl+Enter to send
- Admin: "פניות" tab in `/admin` — lists all tickets with unread badge, search, status filter
  - Chat pane with full message history, quick-reply templates, and status buttons (פתוחה/בטיפול/סגורה)
- API routes: `GET/POST /api/hadar/tickets`, `GET/POST /api/hadar/tickets/:id/messages` (user)
- API routes: `GET/GET/POST/PATCH /api/hadar/admin/tickets/:id` (admin, x-admin-secret)

### User Account Area (האזור האישי)
- `/design-templates/my-designs` rebuilt with 4 tabs:
  1. **ההורדות שלי** — paid orders only with secure download/edit button
  2. **ההזמנות שלי** — all orders (pending/paid/failed) with status badges and action buttons
  3. **הטיוטות שלי** — draft designs grid with edit/delete/pay actions
  4. **פרטי תשלום** — shows saved Stripe payment methods (brand, last4, exp); delete card support
- Header includes "תמיכה" shortcut link to support page
- Saved payment methods via Stripe SetupIntent flow
- API routes: `POST /api/hadar/setup-intent`, `GET/POST/DELETE /api/hadar/payment-methods`

### Navigation
- "תמיכה" added to home page header nav (desktop + mobile menu)
- `/support` and `/my-designs` both auth-guarded via AuthGuard component in App.tsx

### Database Tables (הדר)
- `hadar_designs` — id, clerk_user_id, template_id, design_name, field_values (jsonb), status (draft/paid/submitted), stripe_session_id, created_at, updated_at
- `hadar_orders` — id, clerk_user_id, design_id, template_id, stripe_session_id, stripe_payment_intent, amount, currency, status (pending/paid/failed), created_at
- `hadar_tickets` — id, clerk_user_id, user_email, subject, status (open/in_progress/closed), unread_admin, unread_user, created_at, updated_at
- `hadar_ticket_messages` — id, ticket_id, sender_type (user/admin), sender_label, message, attachment_url, created_at
- `hadar_payment_methods` — id, clerk_user_id, stripe_customer_id, stripe_payment_method_id, brand, last4, exp_month, exp_year, is_default, created_at
