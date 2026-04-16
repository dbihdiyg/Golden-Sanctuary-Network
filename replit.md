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
