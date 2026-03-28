'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Nav from '@/components/Nav'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Profile {
  has_key: boolean
  key_preview: string | null
  plan: 'free' | 'pro'
}

export default function SettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // API key section state
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [keyFeedback, setKeyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [savingKey, setSavingKey] = useState(false)

  // Billing section state
  const [billingLoading, setBillingLoading] = useState(false)
  const [billingError, setBillingError] = useState<string | null>(null)

  // Sign out state
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setEmail(session.user.email ?? null)

      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        // Pre-fill the input with the key preview so users know a key exists
        if (data.key_preview) {
          setApiKeyInput(data.key_preview)
        }
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSaveKey() {
    if (!apiKeyInput.trim()) return
    setSavingKey(true)
    setKeyFeedback(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anthropic_api_key: apiKeyInput.trim() }),
      })
      if (res.ok) {
        setKeyFeedback({ type: 'success', message: 'API key saved.' })
        // Refresh profile so has_key and key_preview update
        const updated = await fetch('/api/settings')
        if (updated.ok) setProfile(await updated.json())
      } else {
        const err = await res.json()
        setKeyFeedback({ type: 'error', message: err.error ?? 'Failed to save key.' })
      }
    } catch {
      setKeyFeedback({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setSavingKey(false)
    }
  }

  async function handleUpgrade() {
    setBillingLoading(true)
    setBillingError(null)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setBillingError(data.error ?? 'Failed to start checkout.')
        setBillingLoading(false)
      }
    } catch {
      setBillingError('Network error. Please try again.')
      setBillingLoading(false)
    }
  }

  async function handleManageBilling() {
    setBillingLoading(true)
    setBillingError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setBillingError(data.error ?? 'Failed to open billing portal.')
        setBillingLoading(false)
      }
    } catch {
      setBillingError('Network error. Please try again.')
      setBillingLoading(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const inputClass =
    'w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3.5 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors'

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Nav crumbs={[{ label: 'Settings' }]} />
        <div className="flex items-center justify-center py-32">
          <svg className="animate-spin w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Nav crumbs={[{ label: 'Settings' }]} />

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* API Key */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-1">Anthropic API Key</h2>
          <p className="text-sm text-zinc-400 mb-5">
            Your key is used to generate ad copy. It is stored securely and never logged.
          </p>

          <div className="space-y-3">
            <input
              type="password"
              className={inputClass}
              placeholder="sk-ant-..."
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value)
                setKeyFeedback(null)
              }}
              autoComplete="off"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveKey}
                disabled={savingKey || !apiKeyInput.trim()}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {savingKey ? 'Saving...' : 'Save key'}
              </button>

              {keyFeedback && (
                <span
                  className={`text-sm ${
                    keyFeedback.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {keyFeedback.message}
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-500">
              Get an API key at console.anthropic.com
            </p>
          </div>
        </section>

        {/* Plan */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-base font-semibold text-white">Plan</h2>
            {profile?.plan === 'pro' ? (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30">
                Pro
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400 border border-zinc-600/50">
                Free
              </span>
            )}
          </div>

          <p className="text-sm text-zinc-400 mb-5">
            {profile?.plan === 'pro'
              ? 'On the pro plan, we handle API costs. $29/month.'
              : 'On the free plan, you provide your own Anthropic API key.'}
          </p>

          {billingError && (
            <p className="text-sm text-red-400 mb-3">{billingError}</p>
          )}

          {profile?.plan === 'pro' ? (
            <button
              onClick={handleManageBilling}
              disabled={billingLoading}
              className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-100 text-sm font-medium px-4 py-2 rounded-lg border border-zinc-700 transition-colors"
            >
              {billingLoading ? 'Loading...' : 'Manage billing'}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={billingLoading}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {billingLoading ? 'Loading...' : 'Upgrade to Pro'}
            </button>
          )}
        </section>

        {/* Account */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Account</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Signed in as</p>
              <p className="text-sm text-zinc-100 font-medium mt-0.5">{email}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-sm text-zinc-400 hover:text-red-400 disabled:opacity-50 transition-colors"
            >
              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </section>

      </main>
    </div>
  )
}
