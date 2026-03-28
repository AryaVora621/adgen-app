'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'

interface ImportedProduct {
  name: string
  description: string
  image_url: string
  price: string
  target_audience: string
}

const inputClass =
  'w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3.5 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors'

export default function ImportGeneratePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [products, setProducts] = useState<ImportedProduct[]>([])
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [parseLoading, setParseLoading] = useState(false)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [businessName, setBusinessName] = useState('')
  const [brandColor, setBrandColor] = useState('#7c3aed')
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File) {
    setParseLoading(true)
    setParseError('')
    setFileName(file.name)
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

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  async function handleGenerate() {
    if (!businessName || products.length === 0) return
    setGenerateLoading(true)
    setProgress({ done: 0, total: products.length })

    let lastBusinessId = ''
    for (let i = 0; i < products.length; i++) {
      const p = products[i]
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          brand_color: brandColor,
          product_name: p.name,
          product_description: p.description,
          product_image_url: p.image_url,
          product_price: p.price,
          target_audience: p.target_audience,
          input_method: 'import',
        }),
      })
      const data = await res.json()
      if (res.ok) lastBusinessId = data.business_id
      setProgress({ done: i + 1, total: products.length })
    }

    if (lastBusinessId) router.push(`/dashboard/${lastBusinessId}`)
  }

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="min-h-screen bg-zinc-950">
      <Nav
        crumbs={[
          { label: 'Generate', href: '/generate' },
          { label: 'Bulk Import' },
        ]}
      />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Bulk import products</h1>
          <p className="text-sm text-zinc-400">
            Upload a CSV or Excel file. Required columns:{' '}
            <code className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-xs">name</code>,{' '}
            <code className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-xs">description</code>.
            Optional: <code className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-xs">image_url</code>,{' '}
            <code className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-xs">price</code>,{' '}
            <code className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-xs">target_audience</code>.
          </p>
        </div>

        <div className="space-y-6">
          {/* Business info */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Business</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-300">
                  Business Name <span className="text-violet-400">*</span>
                </label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Acme Corp"
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

          {/* File upload */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">File</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragging
                  ? 'border-violet-500 bg-violet-500/5'
                  : 'border-zinc-700 hover:border-zinc-500'
              }`}
            >
              {parseLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-zinc-400 text-sm">Parsing file...</p>
                </div>
              ) : fileName && products.length > 0 ? (
                <div className="flex flex-col items-center gap-2">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-emerald-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-zinc-300 text-sm font-medium">{fileName}</p>
                  <p className="text-zinc-500 text-xs">{products.length} products found - click to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-zinc-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <div>
                    <p className="text-zinc-300 text-sm font-medium">Drop your file here, or click to browse</p>
                    <p className="text-zinc-500 text-xs mt-1">CSV, XLS, or XLSX</p>
                  </div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
            </div>
            {parseError && (
              <p className="text-red-400 text-sm mt-3 flex items-center gap-1.5">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {parseError}
              </p>
            )}
          </section>

          {/* Preview table */}
          {products.length > 0 && (
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
                <span className="text-sm font-semibold text-white">{products.length} products</span>
                <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">
                  ready to generate
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-800">
                    <tr>
                      {['Name', 'Description', 'Price', 'Audience'].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {products.map((p, i) => (
                      <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-3 font-medium text-zinc-200 max-w-36 truncate">{p.name}</td>
                        <td className="px-5 py-3 text-zinc-400 max-w-56 truncate">{p.description}</td>
                        <td className="px-5 py-3 text-zinc-400">{p.price || '-'}</td>
                        <td className="px-5 py-3 text-zinc-400 max-w-36 truncate">{p.target_audience || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Progress */}
          {generateLoading && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300 font-medium">Generating ad sets...</span>
                <span className="text-zinc-400">{progress.done}/{progress.total}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={products.length === 0 || !businessName || generateLoading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {generateLoading
              ? `Generating ${progress.done}/${progress.total}...`
              : products.length > 0
              ? `Generate Ads for ${products.length} Product${products.length !== 1 ? 's' : ''}`
              : 'Upload a file to continue'}
          </button>
        </div>
      </main>
    </div>
  )
}
