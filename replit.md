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

### User Flow (Login → Edit → Pay → Files)
1. User browses gallery → clicks "ערוך" on a template
2. Editor page opens with auth wall overlay on preview — "נדרשת כניסה לחשבון"
3. User signs in/up → returns to editor (auth wall disappears)
4. User edits text fields and can save drafts
5. Clicks "קבלת העיצוב הסופי — ₪49" → Payment modal (PaymentWall component)
6. Modal describes what they get, confirms price → Redirects to Stripe Checkout
7. After payment → returns to editor with success banner
8. Editor verifies payment via `/api/hadar/checkout/verify`
9. WhatsApp link to get the final design files

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
- **Typography**: full Hebrew font picker (16 fonts via HEBREW_FONTS + custom DB fonts), exact px font size slider (8–120px), bold/italic/underline toggles
- **Color**: hex color picker + 12 presets (gold, cream, white, navy, etc.)
- **Spacing**: letter-spacing slider (-10–30px), line-height slider (0.6–4.0)
- **Layout**: x/y/width/z-index number inputs, align buttons (RTL-aware)
- **Behavior**: multiline toggle, `fixed` toggle (locks slot for customers)
- Google Fonts loaded dynamically when font family changes in admin

### Customer Text Effects (SlotStylePanel) — Advanced
`SlotStyle` interface in `src/components/SlotStylePanel.tsx`. Applied in `buildSlotCSS` / `buildSlotWrapperCSS` in editor.tsx.

**Sections (collapsible UI):**
1. **גופן ואותיות** — fontFamily, fontSize, color, bold/italic/underline
2. **ריווח ומיקום** — letterSpacing, lineHeight, opacity, rotation (±180°), skewX/Y (±45°)
3. **צל ועומק** — shadow (X/Y/blur/color), 3D Extrude (depth+angle+color), Long Shadow (length+angle+color)
4. **זוהר ואור** — glow (glowColor, glowRadius, glowIntensity 1–4 layers)
5. **גרדיאנט ומרקם** — gradient (from/to/angle) + 5 built-in textures: gold-foil, silver, fire, neon, rainbow
6. **קו ומסגרת** — stroke (color+width), Glass background (blur+color+borderRadius), Blend mode (multiply/screen/overlay/soft-light)
7. **עיקום טקסט** — warpType: none/arc-up/arc-down/wave/circle, arcDegrees (-80–80)

**Rendering:**
- Gradient/texture uses CSS `-webkit-background-clip: text` with `WebkitTextFillColor: transparent`
- All warps use `SvgWarpText` SVG component — arc uses circular arc path, wave uses sinusoidal polyline, circle uses full circular textPath
- Shadow/glow/3D extrude/long-shadow all rendered via `text-shadow` chain built by `buildTextShadows()`
- Wrapper-level effects (rotation, skew, opacity, blend mode, glass) applied by `buildSlotWrapperCSS()`

### TextSlot / AdminSlot Architecture
- `TextSlot` (in `src/lib/data.ts`): shared interface used by editor renderer
- Key fields: `fontSizePx` (px, overrides old `fontSize` enum), `fontFamily` (full font name or "serif"/"sans"), `color` (hex or named), `opacity`, `letterSpacing`, `lineHeight`, `textShadow`, `zIndex`, `fixed`
- Backward compatible: old `fontSize` enum + named colors still work
- Slots stored as JSON in `hadar_templates.slots` column

### Database Tables (הדר)
- `hadar_designs` — id, clerk_user_id, template_id, design_name, field_values (jsonb), status (draft/paid/submitted), stripe_session_id, created_at, updated_at
- `hadar_orders` — id, clerk_user_id, design_id, template_id, stripe_session_id, stripe_payment_intent, amount, currency, status (pending/paid/failed), created_at
