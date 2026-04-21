# Forge

A social / lifestyle web app — a personal pet project exploring how far a solo developer can push the modern React/Next.js stack while keeping a coherent, polished UX.

> 📦 **Status:** active personal project · **Stack year:** 2026

---

## What it is

Forge is a social platform that blends a content feed, direct messages, and a personal-growth cabinet (goals, achievements, workouts, notes) into one app. It's a playground where I experiment with the current-year React ecosystem — Next.js 16 App Router, React 19, Supabase, realtime via Ably, and end-to-end encrypted chat — and ship end-user features across the whole stack.

## Features

**Social**
- Feed with posts, hashtags, reactions
- Reels (short vertical video)
- Stories (ephemeral content)
- Groups
- Public and private profiles
- Notifications center
- Search & hashtag discovery

**Messaging**
- Direct messages with realtime delivery (Ably pub/sub)
- **End-to-end encryption** of text and media (photos are encrypted before upload, decrypted only on recipient's device)
- Typing indicators, read receipts

**Personal cabinet (the "lifestyle" half)**
- Goals system with XP rewards on completion
- Achievements and pulse widget
- Workouts tracker
- Notes with tags and custom categories
- Interactive 30-day activity grid (click → popup)
- Calendar widget (monthly view)
- Built-in photo editor (filters, brightness/contrast, rotation)

**Platform**
- PWA with push notifications (VAPID, web-push)
- Dark / light themes
- Bilingual UI (RU / EN)
- QR-code sharing for profiles and invites

## Tech stack

| Area | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, RSC, Server Actions) |
| UI | **React 19**, Tailwind CSS v4, shadcn/ui, Base UI, Lucide icons |
| Backend-as-a-service | **Supabase** (Postgres + Auth + RLS + Storage) |
| Realtime | **Ably** (channels, presence) |
| Push | web-push, VAPID |
| Language | TypeScript (strict) |
| Deploy | **Vercel** (Edge + Serverless functions) |
| Lint / format | ESLint 9, Tailwind-merge |

## Architecture

```
src/
├── app/               # Next.js App Router: pages, layouts, route handlers
├── features/          # Feature-sliced modules (one folder per bounded context)
│   ├── messages/      #   E2E chat, key exchange, encryption
│   ├── feed/          #   Posts, reactions, hashtags
│   ├── reels/         #   Vertical video player
│   ├── stories/       #   Ephemeral content
│   ├── groups/        #   Communities
│   ├── goals/         #   Targets + XP system
│   ├── achievements/  #   Earned badges + pulse
│   ├── workouts/      #   Tracker
│   ├── photo-editor/  #   Client-side image processing
│   ├── push/          #   Web push registration + dispatch
│   └── ...
├── components/ui/     # shadcn primitives
├── lib/               # Shared utilities: supabase client, ably client, crypto, etc.
└── middleware.ts      # Auth / route protection at the edge
```

Key design choices:
- **Feature-sliced organization** — each feature owns its components, hooks, server actions, and types, making the codebase navigable as it grows.
- **Server Components by default** — client components only where interactivity or state is genuinely needed.
- **Row Level Security in Supabase** — authorization lives in the database, not scattered through API code.
- **E2E encryption of messages happens client-side** — server stores only ciphertext; keys live in the browser's storage.

## Running locally

```bash
# install
npm install

# copy env template and fill in your own credentials
cp .env.example .env.local
# you'll need:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SECRET_KEY
#   ABLY_ROOT_KEY
#   NEXT_PUBLIC_VAPID_PUBLIC_KEY
#   VAPID_PRIVATE_KEY

# dev server
npm run dev

# production build
npm run build && npm start
```

## Why this project exists

Three reasons:

1. **Staying sharp on the current stack.** My day job is backend-heavy (Node.js, PostgreSQL, Kafka). Forge is where I keep my React / Next.js / frontend-adjacent skills current — and 2026-stack specifically (Next.js 16, React 19, Tailwind v4 are all recent releases).
2. **End-to-end ownership.** In a company project you usually own one layer. Here I own everything: product decisions, schema design, auth, crypto, UI, deployment, monitoring. It's a different kind of muscle.
3. **A reason to ship.** Real users (me and a few friends) use it, which forces me to care about reliability, UX polish, and not breaking things on deploy.

## License

Personal / non-commercial. See LICENSE if attached.
