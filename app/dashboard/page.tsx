'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Business {
  id: string
  name: string
  website: string | null
  created_at: string
  product_count?: number
  ad_count?: number
}

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })

      if (!biz) { setLoading(false); return }

      // Count products and ads per business
      const enriched = await Promise.all(
        biz.map(async (b) => {
          const [{ count: pc }, { count: ac }] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', b.id),
            supabase.from('ads').select('*', { count: 'exact', head: true }).eq('business_id', b.id),
          ])
          return { ...b, product_count: pc || 0, ad_count: ac || 0 }
        })
      )
      setBusinesses(enriched)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-lg">AdGen Dashboard</span>
          <Link
            href="/generate"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Generate Ads
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">All Businesses</h1>

        {loading ? (
          <div className="text-gray-400 py-20 text-center">Loading...</div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No businesses yet.</p>
            <Link href="/generate" className="text-indigo-600 font-medium hover:underline">
              Generate your first ad set
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Business</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Products</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Ads</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Created</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{b.name}</div>
                      {b.website && (
                        <div className="text-xs text-gray-400 truncate max-w-48">{b.website}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{b.product_count}</td>
                    <td className="px-6 py-4 text-gray-600">{b.ad_count}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dashboard/${b.id}`}
                          className="text-indigo-600 hover:underline font-medium"
                        >
                          View
                        </Link>
                        <a
                          href={`/api/export/${b.id}`}
                          className="text-gray-500 hover:text-gray-700 hover:underline"
                        >
                          Export ZIP
                        </a>
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
