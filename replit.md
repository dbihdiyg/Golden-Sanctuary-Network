# Overview

This workspace is a pnpm monorepo using TypeScript, housing two main applications:

1.  **קהילת הבוגרים Website**: A Hebrew RTL single-page alumni community website with a dark, luxurious, spiritual aesthetic. It features a cinematic hero section, updates, a masonry gallery with lightbox, video cards, a downloadable PDF library, a community feed, and an "Ask the Rabbi" section. The site has undergone a brand upgrade, incorporating a new logo and a visual palette of black/graphite, luminous gold, and deep royal blue. It's expanded into a multi-page hub with enhanced navigation, interactive elements, and dedicated content pages.

2.  **הדר — Automated Video Marketplace**: A VIDEO-ONLY Hebrew RTL marketplace (After Effects/Nexrender automated rendering). NO image templates, NO Polotno editor, NO FFmpeg text overlays. Key features:
    - **Video-only flow**: Browse video templates → fill fields → Stripe ₪49 payment → AE render → download.
    - **After Effects rendering via Nexrender**: All rendering is AE-only. Requires `NEXRENDER_API_URL` env var pointing to a running nexrender server. If not configured, admin shows a warning banner and jobs fail with a clear error.
    - **Admin panel** (tabs: וידאו / פניות / סטטיסטיקות): Video templates CRUD (AE project upload, field definitions, AE layer mappings), video jobs manager with retry, tickets manager, video stats with nexrender health indicator.
    - **Priority render queue**: `renderQueue.ts` — concurrency via `RENDER_CONCURRENCY`, premium jobs get priority, rolling ETA per tier.
    - **Signed download URLs**: HMAC-SHA256 signed tokens with 48h expiry (`signedUrls.ts`). `GET /api/hadar/dl/:token` for email links. `DOWNLOAD_LINK_SECRET` env var for signing.
    - **Email notifications**: `emailService.ts` — video-ready email with signed download link, video-failed email, admin failure alert.
    - **Job status flow**: pending → paid → queued → rendering → ready/failed.
    - **My Videos dashboard**: Real-time progress bar, queue position, ETA countdown, premium badge, ready toast. Polls every 4s.
    - **Routes (frontend)**: `/` → VideoGallery, `/video/:slug` → VideoDetail, `/my-videos` → MyVideos (auth), `/admin` → Admin, `/sign-in`, `/sign-up`, `/support`.
    - **Backend routes**: `hadar-video.ts` (all endpoints incl. admin auth, media proxy, stats), `hadar-tickets.ts`. All image/design/AI/payment routes removed.
    - DB tables: `hadar_video_templates`, `hadar_video_jobs`, `hadar_support_tickets`.

Both applications are integrated with a shared authentication system (Clerk) and utilize a PostgreSQL database.

# User Preferences

I want iterative development. I want to be asked before you make any major changes to the codebase. I prefer detailed explanations for complex implementations.

# System Architecture

The project is structured as a pnpm workspace monorepo, with each package managing its own dependencies. Node.js 24 and TypeScript 5.9 are used across the board.

## UI/UX Decisions:
-   **קהילת הבוגרים**: Hebrew RTL with dark luxury spiritual styling, using a palette of black/graphite, luminous gold, and deep royal blue. Features scroll-reveal animations, gold shimmer text, ornate section headers, and active navigation link indicators.
-   **הדר**: Hebrew RTL with a navy/gold/cream aesthetic. Utilizes specific Hebrew fonts, dark/light mode toggles, multi-language support (Hebrew/English), and floating chat widgets.
-   **Shared**: Consistent use of Clerk for authentication UI, tailored with application-specific branding.

## Technical Implementations:
-   **API Framework**: Express 5 is used for the backend API servers.
-   **Database**: PostgreSQL is the primary database, managed with Drizzle ORM for existing tables and raw `pool.query` for new ones.
-   **Authentication**: Clerk is integrated for user authentication, managing sign-in, sign-up, user portals, and admin access control.
-   **Validation**: Zod is used for schema validation, with `drizzle-zod` for Drizzle integration.
-   **API Codegen**: Orval is used to generate API hooks and Zod schemas from OpenAPI specifications.
-   **Build Tool**: esbuild is used for bundling into CommonJS.
-   **AI Integration**: GPT-4o-mini is used for AI-powered text generation in the הדר marketplace, specifically for ceremonial invitation text.
-   **Payment Processing**: Stripe is integrated for handling payments in the הדר marketplace, including checkout sessions, webhooks, and managing customer payment methods.
-   **Video Rendering (הדר)**: After Effects-only rendering via Nexrender. `videoRenderer.ts` handles the AE render pipeline: job pickup → nexrender API call → poll for completion → upload to object storage → signed download URL. No FFmpeg or Polotno dependencies.

## CMS (Content Management System):
The alumni community site has a full DB-backed CMS (no code editing required):
- **Tables**: `cms_announcements`, `cms_gallery`, `cms_videos`, `cms_pdfs`, `cms_events`
- **Public API**: `GET /api/cms/{announcements|gallery|videos|pdfs|events}` — returns only active, non-expired items
- **Admin API**: `GET|POST|PUT|DELETE /api/cms/admin/{type}[/:id]` — full CRUD, protected by `requireAdmin`
- **File uploads**: multer → Object Storage → `/api/cms/media/` proxy (gallery images, PDF files)
- **Announcements**: Appear as dismissible banner bars at top of homepage. Variants: info/gold/warning/success. Support links (url, youtube, audio, pdf types).
- **Gallery**: API-driven with fallback to hardcoded photos. Same lightbox UI.
- **Videos**: CMS videos override YouTube API feed when present. Admins paste YouTube URL, ID extracted automatically.
- **PDFs**: CMS PDFs override hardcoded fallback list. Support file upload or external URL.
- **Admin UI**: New "תוכן" tab in AdminPage.tsx → `CmsManager.tsx` with sub-tabs for each content type.

## Feature Specifications:
-   **Community Board**: Signed-in users can post, react, and delete their own posts.
-   **Ask Rabbi**: A form for users to submit questions, which are then managed by admins with status tracking.
-   **YouTube Auto-fetch**: An API endpoint to fetch and categorize the latest 15 videos from a specific YouTube channel via RSS.
-   **Hadar Admin Template Editor**: A visual slot editor for templates with live text preview, layer management (visibility, lock, reorder), and detailed typography, color, spacing, and behavior controls. It ensures exact synchronization of slot positioning and styles between the admin and user editors.
-   **Support/Tickets System**: A chat-style support system for authenticated users to open, view, and reply to tickets, with an admin panel for ticket management.
-   **User Account Area (Hadar)**: A consolidated portal for users to manage their downloads, orders, design drafts, and saved payment methods.

# External Dependencies

-   **Authentication**: Clerk (via `@clerk/react` and `@clerk/express`)
-   **Database**: PostgreSQL
-   **ORM**: Drizzle ORM
-   **Validation**: Zod
-   **API Codegen**: Orval
-   **AI**: OpenAI API (for GPT-4o-mini)
-   **Payment Gateway**: Stripe
-   **Email**: Gmail SMTP (for sending emails from Ask Rabbi form)
-   **Video Content**: YouTube RSS feed (for auto-fetching videos)