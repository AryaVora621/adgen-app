# AdGen - AI Ad Generation Platform

Live: **adgen-app-sigma.vercel.app**
Repo: **github.com/AryaVora621/adgen-app**

Paste in a product. Get image ads in 3 formats, ad copy, and social captions - packaged into a ZIP.

---

## What It Does

1. Input product info (manual form, URL scrape, or CSV/Excel upload)
2. Claude Haiku generates headline, body, CTA, and social captions (Instagram/Twitter/LinkedIn)
3. Satori renders PNG ads in 3 sizes: Square 1:1, Story 9:16, Banner 16:9
4. Everything is stored in Supabase and viewable in the admin dashboard
5. One-click ZIP export per business containing all images + copy

---

## Local Dev

```bash
npm install
cp .env.local.example .env.local   # fill in values below
npm run dev
```

### Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://ecgnzqeqzrjvevtuifgd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/generate` | Mode picker (manual / scrape / import) |
| `/generate/manual` | Product form |
| `/generate/scrape` | URL scrape + review |
| `/generate/import` | CSV/Excel bulk upload |
| `/dashboard` | Admin - all businesses |
| `/dashboard/[businessId]` | Per-business ad grid + export |

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Core pipeline: Claude copy + Satori images + DB insert |
| `/api/ads/image` | GET | Edge function - renders PNG via Satori on demand |
| `/api/scrape` | POST | Fetches URL, extracts og:title/description/image |
| `/api/import` | POST | Parses CSV/Excel, returns product array |
| `/api/export/[businessId]` | GET | Streams ZIP of all ads for a business |

---

## Architecture

```
lib/
  supabase.ts     - Lazy Supabase client factory
  claude.ts       - Claude Haiku wrapper, returns AdCopy JSON
  scraper.ts      - cheerio URL scraper
  importer.ts     - xlsx CSV/Excel parser

app/api/
  generate/       - Main pipeline (business + product + Claude + ads)
  ads/image/      - Edge: Satori JSX -> PNG
  scrape/         - URL scraping
  import/         - File parsing
  export/[id]/    - ZIP generation
```

### Supabase Schema (project: ecgnzqeqzrjvevtuifgd)

```
businesses  - id, name, website, brand_color, logo_url
products    - id, business_id, name, description, image_url, price, target_audience, input_method
ad_sets     - id, product_id, business_id, status
ads         - id, ad_set_id, business_id, format, copy_json, image_url, platform
```

RLS: open read/write with anon key (admin-only tool, no public exposure needed).

---

## Tech Stack

- **Next.js 16** App Router, TypeScript, Tailwind CSS
- **@vercel/og** (Satori) - edge PNG rendering, free
- **Supabase** - Postgres + Storage
- **Anthropic SDK** - Claude Haiku for copy generation
- **JSZip** - ZIP export
- **xlsx** - CSV/Excel parsing
- **cheerio** - HTML scraping
