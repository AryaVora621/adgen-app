'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ScrapedData {
  name: string
  description: string
  image_url: string
  price: string
}

export default function ScrapeGeneratePage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [scraped, setScraped] = useState<ScrapedData | null>(null)
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [scrapeError, setScrapeError] = useState('')
  const [generateLoading, setGenerateLoading] = useState(false)
  const [error, setError] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [brandColor, setBrandColor] = useState('#6366f1')

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/generate" className="text-gray-400 hover:text-gray-600 text-sm">
            Generate
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold">Scrape URL</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Scrape a product URL</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Paste a product page URL and we will try to extract the details automatically.
        </p>

        {/* URL input */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/product"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleScrape}
              disabled={!url || scrapeLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {scrapeLoading ? 'Scraping...' : 'Scrape'}
            </button>
          </div>
          {scrapeError && <p className="text-red-500 text-sm mt-2">{scrapeError}</p>}
        </div>

        {/* Scraped data form */}
        {scraped && (
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Review and edit</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your business"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg px-1 cursor-pointer"
                  />
                </div>
              </div>

              {[
                { label: 'Product Name', name: 'name', defaultValue: scraped.name },
                { label: 'Image URL', name: 'image_url', defaultValue: scraped.image_url },
                { label: 'Price', name: 'price', defaultValue: scraped.price },
              ].map(({ label, name, defaultValue }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    name={name}
                    defaultValue={defaultValue}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={scraped.description}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {scraped.image_url && (
                <img
                  src={scraped.image_url}
                  alt=""
                  className="w-32 h-32 object-contain rounded-lg border border-gray-100"
                />
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={generateLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {generateLoading ? 'Generating ads...' : 'Generate Ads'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
