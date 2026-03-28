# Checkpoint - 2026-03-28

## What Was Just Completed

Full AdGen app build + deploy + UI redesign. Cleaned up boilerplate, wrote project docs and task tracking files.

## Current State

**Deploy:** Live at adgen-app-sigma.vercel.app
- Vercel project: `prj_duKXpfwo5jX3xWWXpEyEgl4c9Cdv`
- Team: `team_ZbNc9N7SUc6s914AmEEMocmQ` (AryaVora621's projects)
- GitHub: github.com/AryaVora621/adgen-app (main branch, auto-deploys)

**Supabase:** Project `ecgnzqeqzrjvevtuifgd` (biz-swarm project, shared with biz-swarm-app)
- Tables: businesses, products, ad_sets, ads (+ pre-existing: leads, subscribers)
- RLS: open read/write with anon key

**Env vars in Vercel:** All 3 set (ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

## Open Issues

1. **500 on /api/generate** - was caused by module-level Anthropic client initialization. Fixed in commit `9bd032d` (lazy init, same pattern as Supabase). Fix is deployed - needs manual verification by running a generation.

2. **Mixed content warning on scrape page** - browser warning when scraped product image URL is HTTP not HTTPS. This is a browser auto-upgrade (harmless), but worth noting.

## Next Action

Verify the /api/generate fix by running an actual generation through the scrape or manual flow. If it works end-to-end, the core MVP is verified complete.

After that: pick from TASK_QUEUE.md backlog. Recommended next items:
1. Auth gate on dashboard (quick win, protects the tool)
2. Persistent Supabase Storage for images (makes ZIP export more reliable)
3. Regenerate button (most useful UX improvement)
