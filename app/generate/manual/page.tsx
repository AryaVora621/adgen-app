'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="text-violet-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

const inputClass =
  'w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3.5 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors'

export default function ManualGeneratePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const payload = {
      business_name: form.get('business_name'),
      business_website: form.get('business_website'),
      brand_color: form.get('brand_color') || '#7c3aed',
      product_name: form.get('product_name'),
      product_description: form.get('product_description'),
      product_image_url: form.get('product_image_url'),
      product_price: form.get('product_price'),
      target_audience: form.get('target_audience'),
      input_method: 'manual',
    }

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.detail ? `${data.error}: ${data.detail}` : (data.error || 'Something went wrong'))
      setLoading(false)
      return
    }

    router.push(`/dashboard/${data.business_id}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Nav
        crumbs={[
          { label: 'Generate', href: '/generate' },
          { label: 'Manual Entry' },
        ]}
      />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Enter product details</h1>
          <p className="text-sm text-zinc-400">Claude will generate copy and image ads from this information.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Business</h2>
            <Field label="Business Name" required>
              <input name="business_name" required placeholder="Acme Corp" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Website">
                <input name="business_website" placeholder="https://acme.com" className={inputClass} />
              </Field>
              <Field label="Brand Color" hint="Used in generated images">
                <div className="flex items-center gap-3">
                  <input
                    name="brand_color"
                    type="color"
                    defaultValue="#7c3aed"
                    className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer p-1"
                  />
                  <span className="text-sm text-zinc-500">Pick a color</span>
                </div>
              </Field>
            </div>
          </section>

          {/* Product */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Product</h2>
            <Field label="Product Name" required>
              <input name="product_name" required placeholder="Super Widget Pro" className={inputClass} />
            </Field>
            <Field
              label="Description"
              required
              hint="What does it do? Who is it for? The more detail, the better the copy."
            >
              <textarea
                name="product_description"
                required
                rows={4}
                placeholder="A lightweight ergonomic office chair designed for remote workers who spend 8+ hours at a desk..."
                className={`${inputClass} resize-none`}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price">
                <input name="product_price" placeholder="$249" className={inputClass} />
              </Field>
              <Field label="Target Audience">
                <input name="target_audience" placeholder="Remote workers, 25-45" className={inputClass} />
              </Field>
            </div>
            <Field label="Product Image URL" hint="Optional - will appear in generated images">
              <input name="product_image_url" placeholder="https://cdn.example.com/product.jpg" className={inputClass} />
            </Field>
          </section>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
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
      </main>
    </div>
  )
}
