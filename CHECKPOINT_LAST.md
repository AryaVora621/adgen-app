# Checkpoint - 2026-03-28

## What Was Just Completed

1. Verified /api/generate Vercel deployment status - build succeeded, no new 500s on current deploy.
2. Implemented persistent image storage in `app/api/generate/route.ts`: after creating the ad set, the route now fetches each Satori-rendered PNG and uploads it to Supabase Storage bucket `ads` under `{adSetId}/{format}.png`. The permanent public URL is stored in `ads.image_url`. Falls back to dynamic Satori URL per format if upload fails.

## Current State

**Deploy:** `adgen-app-sigma.vercel.app`
- Latest deployment: `dpl_7CfrByDJuztFLgqizLMzjE8sWD8h` (state: READY, commit `8f3f003` - cleanup)
- Fix commit `9bd032d` (lazy Anthropic init) is live and confirmed - no 500s on that deployment
- One logged 500 (`Business insert error`) was on the fix-commit deploy itself, likely a test run during that session; the current (cleanup) deploy has zero errors

**Code change:** `app/api/generate/route.ts` only
- `formats` moved up, before `adRows`
- Bucket existence check + per-format upload loop added between ad set creation and ad row insertion
- `adRows` now use `storedImageUrls[format]`
- Return value `image_urls` now uses `storedImageUrls`

**Supabase Storage bucket:** `ads` - will be auto-created on first generation if it doesn't exist yet. Bucket is public.

## Next Action

Commit and deploy the storage change, then run one end-to-end generation to confirm:
1. Bucket `ads` is created in Supabase
2. `ads.image_url` rows contain `storage.supabase.co` URLs (not `/api/ads/image?...`)
3. ZIP export downloads permanent PNGs correctly

After verification, pick next item from TASK_QUEUE.md (recommended: auth gate on dashboard).

## Open Decisions

- The anon key is used for storage uploads (same as DB). If RLS is tightened later, a service role key will be needed for the upload path in `/api/generate`.
