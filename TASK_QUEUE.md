# AdGen - Task Queue

## Done

- [x] Project scaffold (Next.js 16, TypeScript, Tailwind)
- [x] Supabase schema: businesses, products, ad_sets, ads tables + RLS policies
- [x] `lib/claude.ts` - Claude Haiku ad copy generation (headline, body, CTA, social captions)
- [x] `lib/scraper.ts` - cheerio URL scraper (og:title, og:description, og:image, price)
- [x] `lib/importer.ts` - xlsx CSV/Excel parser with column name aliases
- [x] `/api/generate` - full pipeline: business upsert, product insert, Claude, Satori URLs, ad_sets + ads insert
- [x] `/api/ads/image` - Satori edge function, 3 formats (square/story/banner), brand color support
- [x] `/api/scrape` - URL scrape endpoint
- [x] `/api/import` - file upload + parse endpoint
- [x] `/api/export/[businessId]` - ZIP stream with images + copy.txt per product
- [x] Manual entry form (`/generate/manual`)
- [x] URL scrape flow (`/generate/scrape`)
- [x] Bulk import flow (`/generate/import`) with drag-drop + progress bar
- [x] Admin dashboard (`/dashboard`) with stats cards + business table
- [x] Per-business view (`/dashboard/[businessId]`) with format toggle + social captions
- [x] Dark theme UI redesign (zinc-950 base, violet accent, Nav component)
- [x] Fix: lazy Supabase client init (was failing at build time)
- [x] Fix: lazy Anthropic client init (same pattern)
- [x] Fix: Next.js 16 async params in export route
- [x] Deployed to Vercel (adgen-app-sigma.vercel.app) via GitHub integration
- [x] Env vars set in Vercel (ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [x] Cleanup: removed 5 boilerplate SVGs from public/
- [x] Replaced generic README with project-specific docs

---

## In Progress

- [ ] **BUG: /api/generate 500** - was lazy init issue with Anthropic client, fix deployed in commit 9bd032d. Needs verification after Vercel redeploy picks up the fix.

---

## Backlog

### Bugs / Polish
- [ ] Dashboard pages create Supabase client inline instead of using `getSupabase()` helper - minor inconsistency
- [ ] `next.config.ts` needs `images.remotePatterns` for external product images (shows warning in Next.js)
- [ ] Add error boundary components to client pages (currently no React error boundaries)
- [ ] Story format image preview too wide in dashboard - constrain max-width better on mobile

### Features
- [ ] **Auth** - password protect /dashboard (simple password gate or Supabase Auth)
- [ ] **Regenerate** - button to re-run Claude + images for an existing product
- [ ] **Delete** - remove an ad set or business from dashboard
- [ ] **Persistent images** - currently Satori renders on-demand; upload PNGs to Supabase Storage at generation time so ZIPs always work even if edge function changes
- [ ] **Custom themes** - 2-3 Satori template options (minimal, bold, product-photo-focused)
- [ ] **Client portal** - `/client/[businessId]` where businesses can view their own ads with a shareable link (no login required)
- [ ] **Edit copy** - inline editing of headline/body/CTA in the dashboard before exporting
- [ ] **Webhook** - POST to a URL when a new ad set is generated (for Zapier / automation)
- [ ] **Generation history** - show created_at timestamps, filter by date in dashboard

### Infrastructure
- [ ] Add `NEXT_PUBLIC_APP_URL` env var and use it in `/api/generate` instead of `req.nextUrl.origin` (more reliable in edge cases)
- [ ] Rate limiting on `/api/generate` (Claude API costs money per call)
- [ ] Move Supabase RLS from open-all to service-role-key on server routes (more secure)
