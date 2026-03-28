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
          <p className="text-xs text-zinc-500 mt-4">No account needed. Works with any product.</p>
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

        {/* How it works */}
        <div className="relative w-full max-w-3xl mx-auto mt-16">
          <div className="border-t border-zinc-800 mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                number: '1',
                title: 'Input a product',
                description: 'Paste a URL, fill a form, or upload a CSV - we handle all three.',
              },
              {
                number: '2',
                title: 'Claude writes the copy',
                description: 'Headline, body, CTA, and social captions generated in seconds.',
              },
              {
                number: '3',
                title: 'Download your ads',
                description: '3 image formats plus social captions, packaged in a clean ZIP.',
              },
            ].map(({ number, title, description }) => (
              <div key={number} className="flex flex-col items-center text-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">{number}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{title}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
