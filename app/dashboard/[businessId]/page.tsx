'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { use } from 'react'
import Nav from '@/components/Nav'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Ad {
  id: string
  format: string
  copy_json: Record<string, string>
  image_url: string | null
  platform: string | null
  ad_set_id: string
}

interface AdSet {
  id: string
  product_name: string
  ads: Ad[]
}

const FORMAT_LABELS: Record<string, string> = {
  square: 'Square 1:1',
  story: 'Story 9:16',
  banner: 'Banner 16:9',
}

const PLATFORM_ICONS: Record<string, string> = {
  social_instagram: 'Instagram',
  social_twitter: 'X / Twitter',
  social_linkedin: 'LinkedIn',
}

export default function BusinessPage({
  params,
}: {
  params: Promise<{ businessId: string }>
}) {
  const { businessId } = use(params)
  const [businessName, setBusinessName] = useState('')
  const [brandColor, setBrandColor] = useState('#7c3aed')
  const [adSets, setAdSets] = useState<AdSet[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFormat, setActiveFormat] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      const [{ data: biz }, { data: ads }] = await Promise.all([
        supabase.from('businesses').select('name, brand_color').eq('id', businessId).single(),
        supabase
          .from('ads')
          .select('*, ad_sets(id, product_id, products(name))')
          .eq('business_id', businessId),
      ])

      if (biz) {
        setBusinessName(biz.name)
        if (biz.brand_color) setBrandColor(biz.brand_color)
      }
      if (!ads) { setLoading(false); return }

      const byAdSet = new Map<string, AdSet>()
      for (const ad of ads) {
        const adSetId = ad.ad_set_id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const productName = (ad.ad_sets as any)?.products?.name || 'Unknown Product'
        if (!byAdSet.has(adSetId)) {
          byAdSet.set(adSetId, { id: adSetId, product_name: productName, ads: [] })
        }
        byAdSet.get(adSetId)!.ads.push(ad)
      }

      setAdSets(Array.from(byAdSet.values()))
      setLoading(false)
    }
    load()
  }, [businessId])

  return (
    <div className="min-h-screen bg-zinc-950">
      <Nav
        crumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: businessName || '...' },
        ]}
        action={
          <a
            href={`/api/export/${businessId}`}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export ZIP
          </a>
        }
      />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <svg className="animate-spin w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : adSets.length === 0 ? (
          <div className="text-center py-24 text-zinc-500">No ad sets for this business yet.</div>
        ) : (
          <div className="space-y-8">
            {adSets.map((set) => {
              const currentFormat = activeFormat[set.id] || 'square'
              const imageAd = set.ads.find((a) => a.format === currentFormat)
              const copyAd = set.ads.find((a) => a.format === 'square')
              const socialAds = set.ads.filter((a) => a.format.startsWith('social_'))

              return (
                <div key={set.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                    <h2 className="font-semibold text-white">{set.product_name}</h2>
                    <div className="flex items-center gap-1.5">
                      {Object.entries(FORMAT_LABELS).map(([fmt, label]) => (
                        <button
                          key={fmt}
                          onClick={() => setActiveFormat((p) => ({ ...p, [set.id]: fmt }))}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            currentFormat === fmt
                              ? 'bg-violet-600 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                    {/* Image preview */}
                    <div className="lg:col-span-3 p-6 flex items-center justify-center bg-zinc-950/50 min-h-64">
                      {imageAd?.image_url ? (
                        <img
                          src={imageAd.image_url}
                          alt={`${set.product_name} - ${currentFormat}`}
                          className={`rounded-xl shadow-lg max-h-96 ${
                            currentFormat === 'story' ? 'max-w-[200px]' : 'w-full max-w-lg'
                          }`}
                        />
                      ) : (
                        <div className="w-full aspect-square max-w-64 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 text-sm">
                          No preview
                        </div>
                      )}
                    </div>

                    {/* Copy panel */}
                    <div className="lg:col-span-2 border-l border-zinc-800 p-6 space-y-5">
                      {/* Ad copy */}
                      {copyAd?.copy_json && (
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Headline</p>
                            <p className="text-zinc-100 font-semibold text-sm leading-snug">
                              {(copyAd.copy_json as { headline?: string }).headline}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Body</p>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                              {(copyAd.copy_json as { body?: string }).body}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">CTA</p>
                            <span
                              className="inline-block text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                              style={{ backgroundColor: brandColor }}
                            >
                              {(copyAd.copy_json as { cta?: string }).cta}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Social captions */}
                      {socialAds.length > 0 && (
                        <div className="border-t border-zinc-800 pt-5 space-y-4">
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Social Captions</p>
                          {socialAds.map((ad) => (
                            <div key={ad.id}>
                              <p className="text-xs text-zinc-500 mb-1.5">{PLATFORM_ICONS[ad.format] || ad.format}</p>
                              <p className="text-zinc-300 text-xs leading-relaxed">
                                {(ad.copy_json as { caption?: string }).caption}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
