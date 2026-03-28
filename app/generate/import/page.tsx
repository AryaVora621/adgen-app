'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ImportedProduct {
  name: string
  description: string
  image_url: string
  price: string
  target_audience: string
}

export default function ImportGeneratePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [products, setProducts] = useState<ImportedProduct[]>([])
  const [parseError, setParseError] = useState('')
  const [parseLoading, setParseLoading] = useState(false)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [businessName, setBusinessName] = useState('')
  const [brandColor, setBrandColor] = useState('#6366f1')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setParseLoading(true)
    setParseError('')

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/import', { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) {
      setParseError(data.error || 'Failed to parse file')
      setParseLoading(false)
      return
    }
    setProducts(data.products)
    setParseLoading(false)
  }

  async function handleGenerate() {
    if (!businessName || products.length === 0) return
    setGenerateLoading(true)
    setProgress({ done: 0, total: products.length })

    let lastBusinessId = ''

    for (let i = 0; i < products.length; i++) {
      const p = products[i]
      const payload = {
        business_name: businessName,
        brand_color: brandColor,
        product_name: p.name,
        product_description: p.description,
        product_image_url: p.image_url,
        product_price: p.price,
        target_audience: p.target_audience,
        input_method: 'import',
      }
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) lastBusinessId = data.business_id
      setProgress({ done: i + 1, total: products.length })
    }

    if (lastBusinessId) router.push(`/dashboard/${lastBusinessId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/generate" className="text-gray-400 hover:text-gray-600 text-sm">
            Generate
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold">Bulk Import</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Bulk import products</h1>
        <p className="text-gray-500 text-sm mb-8">
          Upload a CSV or Excel file. Required columns: <code className="bg-gray-100 px-1 rounded">name</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">description</code>. Optional:{' '}
          <code className="bg-gray-100 px-1 rounded">image_url</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">price</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">target_audience</code>.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name <span className="text-red-400">*</span>
              </label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Acme Corp"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload file</label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <p className="text-gray-400 text-sm">
                {parseLoading
                  ? 'Parsing...'
                  : 'Click to upload CSV or Excel file'}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {parseError && <p className="text-red-500 text-sm mt-2">{parseError}</p>}
          </div>
        </div>

        {/* Preview table */}
        {products.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold">{products.length} products imported</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name', 'Description', 'Price', 'Audience'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-32 truncate">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-48 truncate">
                        {p.description}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.price}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-32 truncate">
                        {p.target_audience}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {generateLoading && (
          <div className="bg-indigo-50 rounded-xl p-4 mb-4 text-center">
            <p className="text-indigo-700 font-medium">
              Generating ads {progress.done}/{progress.total}...
            </p>
            <div className="mt-2 bg-indigo-100 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={products.length === 0 || !businessName || generateLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {generateLoading
            ? `Generating... ${progress.done}/${progress.total}`
            : `Generate Ads for ${products.length} product${products.length !== 1 ? 's' : ''}`}
        </button>
      </main>
    </div>
  )
}
