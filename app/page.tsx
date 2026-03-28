import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 h-14 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="font-bold text-white tracking-tight">AdGen</span>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            Dashboard
          </Link>
          <Link
            href="/generate"
            className="text-sm bg-violet-600 hover:bg-violet-500 text-white font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            Generate
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        {/* Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Powered by Claude AI
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Generate ad creative<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              in seconds, not hours
            </span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Input a product. Get image ads in 3 formats, ad copy, and social captions - all packaged into a clean ZIP. Manual entry, URL scrape, or bulk CSV.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/generate"
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-sm"
            >
              Generate your first ad
            </Link>
            <Link
              href="/dashboard"
              className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium px-7 py-3 rounded-xl transition-colors text-sm"
            >
              View dashboard
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="relative mt-20 flex flex-wrap items-center justify-center gap-3">
          {[
            'Square 1:1 + Story 9:16 + Banner 16:9',
            'Instagram, Twitter, LinkedIn captions',
            'CSV / Excel bulk import',
            'URL auto-scrape',
            'ZIP export per business',
          ].map((f) => (
            <span
              key={f}
              className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-3 py-1.5 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
      </main>
    </div>
  )
}
