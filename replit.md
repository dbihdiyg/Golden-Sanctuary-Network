# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

### קהילת הבוגרים Website

- Standalone React/Vite web artifact at `artifacts/alumni-community` served from `/`.
- Hebrew RTL single-page alumni community website with dark luxury spiritual styling.
- Includes cinematic hero, latest updates, masonry-style gallery with lightbox, video cards, downloadable PDF library, community feed, and footer.
- April 2026 brand upgrade: integrated the attached "מאירים" logo and shifted the visual palette to logo-inspired black/graphite, luminous gold, and deep royal blue.
- Expanded into a multi-page community hub with sticky navigation, floating WhatsApp/Ask Rabbi/join actions, homepage category cards, quick actions, media spotlight, and dedicated pages for photos, videos, PDFs, updates, Ask the Rabbi, contact, join updates, alumni stories, and events.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
