# DevContext – Resume Your Code Brain

## Overview

A full-stack developer tool that helps developers instantly resume their work by analyzing recent GitHub commits and generating AI-powered summaries with smart next steps.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/devcontext) with Tailwind CSS, Framer Motion, Lucide React
- **API framework**: Express 5 (artifacts/api-server)
- **Auth**: GitHub OAuth (session-based via express-session)
- **AI**: OpenAI via Replit AI Integrations (no API key needed) + intelligent mock fallback
- **Database**: PostgreSQL + Drizzle ORM (provisioned separately if needed)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── devcontext/         # React + Vite frontend (serves at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Pricing Tiers

| Tier | Price | AI/mo | Repos | Compare | Standups | Workspaces |
|------|-------|-------|-------|---------|----------|------------|
| Free | ₹0 | 10 | 1 | ✗ | ✗ | ✗ |
| Plus | ₹499/mo | 100 | 3 | ✓ | ✗ | ✗ |
| Pro | ₹999/mo | 500 | 10 | ✓ | ✓ | ✓ |
| Team | ₹2,499/mo | 2,000 | ∞ | ✓ | ✓ | ✓ |

Payments via Razorpay. Team tier supports up to 10 members sharing the subscription.

## Features

1. **GitHub Login** — OAuth flow via `/api/auth/github` → GitHub → `/api/auth/github/callback`
2. **Repository Selection** — Lists user repos sorted by last updated, with search filter + localStorage persistence
3. **Commit Analysis** — Fetches last 15/30/50 commits (configurable) with file diffs; branch selector persisted to localStorage
4. **AI Summary Panel** — Generates "What you were doing", "Key changes", "Suggested next steps" via OpenAI; standup mode included
5. **Mock Fallback** — If OpenAI is unavailable, generates an intelligent context-aware mock summary
6. **Analytics Tracking** — Page views, clicks, and generate events tracked to `analytics_events` PostgreSQL table
7. **Admin Dashboard** — Secured at `/admin/login` with email+password (HMAC-SHA256 hashed); shows stats at `/admin/dashboard`

## API Routes

- `GET /api/healthz` — Health check
- `GET /api/auth/github` — Starts GitHub OAuth flow
- `GET /api/auth/github/callback` — OAuth callback, sets JWT cookie
- `GET /api/auth/me` — Returns current user or 401
- `POST /api/auth/logout` — Clears JWT cookie
- `GET /api/github/repos` — Lists user repos from GitHub API
- `GET /api/github/repos/:owner/:repo/commits` — Lists recent commits
- `GET /api/github/repos/:owner/:repo/commits/:sha` — Commit details with files
- `POST /api/ai/summarize` — AI summary of commit data
- `POST /api/track` — Tracks analytics event (fires-and-forgets from frontend)
- `POST /api/admin/login` — Verifies admin credentials, sets `dc_admin_token` cookie
- `GET /api/admin/me` — Verifies admin session
- `POST /api/admin/logout` — Clears admin cookie
- `GET /api/admin/stats` — Returns analytics stats (admin only)

## Analytics

Events tracked (stored in `analytics_events` table):
- `page_view` — Landing page (`/`) and Dashboard (`/dashboard`)
- `click:connect_github` — "Sign In" and "Connect GitHub to Start" buttons (element: nav_signin / hero_cta)
- `click:generate_summary` — "What's next?" button click with repo/commit metadata
- `click:generate_standup` — "Generate Standup" button click
- `click:copy` — Copy to Markdown button

Session IDs stored in `localStorage` as `dc_session_id` (UUID).

## Admin Dashboard

URL: `/admin/login` → `/admin/dashboard`

Credentials stored as env vars (`ADMIN_EMAIL`, `ADMIN_SALT`, `ADMIN_PASSWORD_HASH`, `ADMIN_JWT_SECRET`).
Password is HMAC-SHA256 hashed with the stored salt. Admin JWT cookie (`dc_admin_token`) expires in 24h.

Dashboard shows: unique users, page views, summaries run, sessions, events-by-type bar chart, 14-day activity chart, recent 50 events table.

## Environment Variables / Secrets

Required secrets:
- `GITHUB_CLIENT_ID` — From your GitHub OAuth App
- `GITHUB_CLIENT_SECRET` — From your GitHub OAuth App

Admin credentials (set as shared env vars):
- `ADMIN_EMAIL` — Admin email address
- `ADMIN_SALT` — HMAC salt (hex string)
- `ADMIN_PASSWORD_HASH` — HMAC-SHA256 hash of password with salt (hex)
- `ADMIN_JWT_SECRET` — Random 32-byte secret for admin JWT signing

Razorpay (payments):
- `RAZORPAY_KEY_ID` — Razorpay live key ID (rzp_live_*)
- `RAZORPAY_KEY_SECRET` — Razorpay secret key

Auto-configured by Replit:
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI proxy base URL
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI proxy API key

## Payments (Razorpay)

Pro tier: ₹999/month via Razorpay Checkout.

### Flow
1. User clicks "Upgrade to Pro" → frontend calls `POST /api/payments/create-order`
2. Backend creates Razorpay order, returns order_id + key_id
3. Frontend opens Razorpay modal (checkout.js loaded dynamically)
4. On payment success, Razorpay calls handler with `{razorpay_payment_id, razorpay_order_id, razorpay_signature}`
5. Frontend posts to `POST /api/payments/verify` → backend verifies HMAC-SHA256 signature
6. On valid signature, user plan is upgraded to "pro" in `user_plans` table
7. Plan query is invalidated, UI updates instantly

### API Endpoints
- `POST /api/payments/create-order` — Creates Razorpay order (auth required)
- `POST /api/payments/verify` — Verifies payment signature and upgrades plan (auth required)

## GitHub OAuth Setup

1. Go to https://github.com/settings/applications/new
2. Fill in:
   - Application name: DevContext
   - Homepage URL: Your Replit app URL (e.g. `https://devcontext.replit.app`)
   - Authorization callback URL: `https://devcontext.replit.app/api/auth/github/callback`
3. Register, copy Client ID and Client Secret → add as Replit Secrets

The callback URL auto-detects the current host from `x-forwarded-host` headers, so it works in both dev and production without reconfiguration.

## Video Artifact (artifacts/devcontext-video)

11-scene animated pitch video built with React, Framer Motion, and Vite:
- Scenes 1-9: Product features (context loss, GitHub connect, commits, AI briefing, standup, dep health, commit health, workspaces)
- Scene 10: Pricing plans (Free/Plus/Pro/Team with prices and limits)
- Scene 11: Closer with brand reveal
- Audio: Web Speech API TTS at key scenes (1, 2, 5, 6, 10, 11) + procedural ambient music via Web Audio API
- No external audio files required

## Development

```bash
# Run frontend
pnpm --filter @workspace/devcontext run dev

# Run API server  
pnpm --filter @workspace/api-server run dev

# Run codegen (after changing OpenAPI spec)
pnpm --filter @workspace/api-spec run codegen
```

## Deployment

When deploying, update your GitHub OAuth App's callback URL to your production `.replit.app` domain. No other configuration changes needed.
