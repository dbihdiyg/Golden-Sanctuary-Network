# Overview

This workspace is a pnpm monorepo using TypeScript, housing two main applications:

1.  **קהילת הבוגרים Website**: A Hebrew RTL single-page alumni community website with a dark, luxurious, spiritual aesthetic. It features a cinematic hero section, updates, a masonry gallery with lightbox, video cards, a downloadable PDF library, a community feed, and an "Ask the Rabbi" section. The site has undergone a brand upgrade, incorporating a new logo and a visual palette of black/graphite, luminous gold, and deep royal blue. It's expanded into a multi-page hub with enhanced navigation, interactive elements, and dedicated content pages.

2.  **הדר — Design Template Marketplace**: A separate React + Vite application serving as a Hebrew RTL design template marketplace with a navy, gold, and cream aesthetic. It allows users to browse, customize, pay for, and download design templates. Key features include an AI-powered text generation for invitations, a comprehensive admin template editor, and a user portal for managing designs, orders, and support tickets. Includes a premium text styling system with 32+ one-click style presets (6 categories: metal, neon, luxury, material, embossed, classic), 22 CSS 3D presets with real text-shadow depth, a Three.js 3D engine with 9 material presets (gold/chrome/silver/rose-gold/copper/platinum/matte/glass/obsidian), real PBR lighting, camera angle controls, auto-rotate, and PNG export. Graceful CSS fallback when WebGL is unavailable.

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
-   **Image/Text Effects (הדר)**: Advanced CSS techniques and a Canvas-based pixel displacement engine (`SvgWarpText`) are used to render complex text effects like gradients, textures, shadows, glows, 3D extrude, and text warping. All visual rendering functions are centralized in a shared engine at `artifacts/design-templates/src/lib/designRenderer.ts` (`buildTextShadows`, `buildTextureGradient`, `buildTextCSS`, `buildWrapperCSS`, `buildAdminWrapperCSS`) — both the admin editor and the user editor import from this single source of truth to guarantee pixel-perfect parity between what the admin designs and what the user sees.

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