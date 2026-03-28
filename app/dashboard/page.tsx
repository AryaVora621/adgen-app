'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Nav from '@/components/Nav'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Business {
  id: string
  name: string
  website: string | null
  brand_color: string
  created_at: string
  product_count?: number
  ad_count?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<Record<string, boolean>>({})
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
  const [showApiKeyBanner, setShowApiKeyBanner] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setUserEmail(session.user.email)
      }
    }

    async function checkApiKey() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.has_key === false && data.plan === 'free') {
            setShowApiKeyBanner(true)
          }
        }
      } catch {
        // silently ignore - banner is non-critical
      }
    }

    loadUser()
    checkApiKey()
  }, [])

  useEffect(() => {
    async function load() {
      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })

      if (!biz) { setLoading(false); return }

      const enriched = await Promise.all(
        biz.map(async (b) => {
          const [{ count: pc }, { count: ac }] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', b.id),
            supabase.from('ad_sets').select('*', { count: 'exact', head: true }).eq('business_id', b.id),
          ])
          return { ...b, product_count: pc || 0, ad_count: ac || 0 }
        })
      )
      setBusinesses(enriched)
      setLoading(false)
    }
    load()
  }, [])

  const totalAds = businesses.reduce((s, b) => s + (b.ad_count || 0), 0)

  async function handleDelete(b: Business) {
    if (!window.confirm(`Delete ${b.name} and all its ads?`)) return

    setDeleting((p) => ({ ...p, [b.id]: true }))
    await supabase.from('businesses').delete().eq('id', b.id)
    setBusinesses((prev) => prev.filter((biz) => biz.id !== b.id))
    setDeleting((p) => ({ ...p, [b.id]: false }))
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Nav
        crumbs={[{ label: 'Dashboard' }]}
        userEmail={userEmail}
        onSignOut={handleSignOut}
        action={
          <Link
            href="/generate"
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Generate
          </Link>
        }
      />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* API key banner - shown when user has no key and is on free plan */}
        {showApiKeyBanner && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-400">API key required</p>
              <p className="text-xs text-amber-400/70 mt-0.5">Add your Anthropic API key in Settings to generate ads.</p>
            </div>
            <Link href="/settings" className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap ml-4">
              Add key →
            </Link>
          </div>
        )}

        {/* Stats */}
        {!loading && businesses.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Businesses', value: businesses.length },
              { label: 'Products', value: businesses.reduce((s, b) => s + (b.product_count || 0), 0) },
              { label: 'Ad Sets Generated', value: totalAds },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-zinc-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-white">Businesses</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <svg className="animate-spin w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <div className="text-4xl mb-4">+</div>
            <p className="text-zinc-400 text-sm mb-5">No businesses yet. Generate your first ad set.</p>
            <Link
              href="/generate"
              className="inline-flex bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-zinc-800">
                <tr>
                  {['Business', 'Products', 'Ad Sets', 'Created', ''].map((h) => (
                    <th
                      key={h}
                      className={`px-5 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider ${
                        h === '' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: b.brand_color || '#7c3aed' }}
                        />
                        <div>
                          <div className="font-medium text-zinc-100 text-sm">{b.name}</div>
                          {b.website && (
                            <div className="text-xs text-zinc-500 truncate max-w-48">{b.website}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-400">{b.product_count}</td>
                    <td className="px-5 py-4 text-sm text-zinc-400">{b.ad_count}</td>
                    <td className="px-5 py-4 text-sm text-zinc-500">
                      {new Date(b.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/dashboard/${b.id}`}
                          className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors"
                        >
                          View
                        </Link>
                        <a
                          href={`/api/export/${b.id}`}
                          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          Export ZIP
                        </a>
                        <button
                          onClick={() => handleDelete(b)}
                          disabled={deleting[b.id]}
                          className="text-sm text-red-500/70 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting[b.id] ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
