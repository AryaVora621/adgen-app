'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { use } from 'react'

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

export default function BusinessPage({
  params,
}: {
  params: Promise<{ businessId: string }>
}) {
  const { businessId } = use(params)
  const [businessName, setBusinessName] = useState('')
  const [adSets, setAdSets] = useState<AdSet[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFormat, setActiveFormat] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      const [{ data: biz }, { data: ads }] = await Promise.all([
        supabase.from('businesses').select('name').eq('id', businessId).single(),
        supabase
          .from('ads')
          .select('*, ad_sets(id, product_id, products(name))')
          .eq('business_id', businessId),
      ])

      if (biz) setBusinessName(biz.name)
      if (!ads) { setLoading(false); return }

      // Group by ad_set
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

  const IMAGE_FORMATS = ['square', 'story', 'banner']
  const SOCIAL_FORMATS = ['social_instagram', 'social_twitter', 'social_linkedin']

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold">{businessName}</span>
          <div className="ml-auto">
            <a
              href={`/api/export/${businessId}`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Export ZIP
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-gray-400 py-20 text-center">Loading...</div>
        ) : adSets.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No ad sets yet.</div>
        ) : (
          <div className="space-y-12">
            {adSets.map((set) => {
              const currentFormat = activeFormat[set.id] || 'square'
              const imageAd = set.ads.find((a) => a.format === currentFormat)
              const copyAd = set.ads.find((a) => a.format === 'square')

              return (
                <div key={set.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">{set.product_name}</h2>
                    <div className="flex gap-2">
                      {IMAGE_FORMATS.map((f) => (
                        <button
                          key={f}
                          onClick={() =>
                            setActiveFormat((prev) => ({ ...prev, [set.id]: f }))
                          }
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            currentFormat === f
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image preview */}
                    <div>
                      {imageAd?.image_url ? (
                        <img
                          src={imageAd.image_url}
                          alt={`${set.product_name} - ${currentFormat}`}
                          className="w-full rounded-lg border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center text-gray-400">
                          No preview
                        </div>
                      )}
                    </div>

                    {/* Copy panel */}
                    <div className="space-y-4">
                      {copyAd?.copy_json && (
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase mb-1">
                              Headline
                            </div>
                            <p className="text-gray-800 font-semibold">
                              {(copyAd.copy_json as { headline?: string }).headline}
                            </p>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase mb-1">
                              Body
                            </div>
                            <p className="text-gray-600 text-sm">
                              {(copyAd.copy_json as { body?: string }).body}
                            </p>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase mb-1">
                              CTA
                            </div>
                            <span className="inline-block bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded">
                              {(copyAd.copy_json as { cta?: string }).cta}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Social captions */}
                      <div className="border-t border-gray-100 pt-4 space-y-3">
                        {SOCIAL_FORMATS.map((sf) => {
                          const socialAd = set.ads.find((a) => a.format === sf)
                          if (!socialAd) return null
                          return (
                            <div key={sf}>
                              <div className="text-xs font-semibold text-gray-400 uppercase mb-1">
                                {sf.replace('social_', '')}
                              </div>
                              <p className="text-gray-600 text-sm">
                                {(socialAd.copy_json as { caption?: string }).caption}
                              </p>
                            </div>
                          )
                        })}
                      </div>
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
