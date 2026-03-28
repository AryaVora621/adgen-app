'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'

interface ScrapedData {
  name: string
  description: string
  image_url: string
  price: string
}

const inputClass =
  'w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3.5 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors'

export default function ScrapeGeneratePage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [scraped, setScraped] = useState<ScrapedData | null>(null)
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [scrapeError, setScrapeError] = useState('')
  const [generateLoading, setGenerateLoading] = useState(false)
  const [error, setError] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [brandColor, setBrandColor] = useState('#7c3aed')

  async function handleScrape() {
    setScrapeLoading(true)
    setScrapeError('')
    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    const data = await res.json()
    if (!res.ok) {
      setScrapeError(data.error || 'Failed to scrape URL')
      setScrapeLoading(false)
      return
    }
    setScraped(data)
    setScrapeLoading(false)
  }

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!scraped) return
    setGenerateLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const payload = {
      business_name: businessName,
      brand_color: brandColor,
      product_name: form.get('name'),
      product_description: form.get('description'),
      product_image_url: form.get('image_url'),
      product_price: form.get('price'),
      input_method: 'scrape',
    }

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setGenerateLoading(false)
      return
    }
    router.push(`/dashboard/${data.business_id}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Nav
        crumbs={[
          { label: 'Generate', href: '/generate' },
          { label: 'Scrape URL' },
        ]}
      />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Scrape a product URL</h1>
          <p className="text-sm text-zinc-400">
            Paste a product page URL - we extract the title, description, image, and price.
          </p>
        </div>

        {/* URL input */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && url && !scrapeLoading && handleScrape()}
              placeholder="https://example.com/products/widget"
              className={inputClass}
            />
            <button
              onClick={handleScrape}
              disabled={!url || scrapeLoading}
              className="bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap flex items-center gap-2"
            >
              {scrapeLoading ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scraping
                </>
              ) : (
                'Scrape'
              )}
            </button>
          </div>
          {scrapeError && (
            <p className="text-red-400 text-sm mt-3 flex items-center gap-1.5">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {scrapeError}
            </p>
          )}
        </div>

        {/* Scraped data + generate form */}
        {scraped && (
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Success banner */}
            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-lg">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Data scraped - review and edit below
            </div>

            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Business</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-zinc-300">
                    Business Name <span className="text-violet-400">*</span>
                  </label>
                  <input
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your business"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-zinc-300">Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer p-1"
                    />
                    <span className="text-sm text-zinc-500">Pick a color</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Product - edit if needed</h2>

              {scraped.image_url && (
                <img
                  src={scraped.image_url}
                  alt=""
                  className="w-24 h-24 object-contain rounded-xl border border-zinc-700 bg-zinc-800"
                />
              )}

              {[
                { label: 'Product Name', name: 'name', defaultValue: scraped.name, type: 'input' },
                { label: 'Image URL', name: 'image_url', defaultValue: scraped.image_url, type: 'input' },
                { label: 'Price', name: 'price', defaultValue: scraped.price, type: 'input' },
              ].map(({ label, name, defaultValue }) => (
                <div key={name} className="space-y-1.5">
                  <label className="block text-sm font-medium text-zinc-300">{label}</label>
                  <input name={name} defaultValue={defaultValue} className={inputClass} />
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-300">Description</label>
                <textarea
                  name="description"
                  defaultValue={scraped.description}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </section>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={generateLoading || !businessName}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {generateLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating ads...
                </>
              ) : (
                'Generate Ads'
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
