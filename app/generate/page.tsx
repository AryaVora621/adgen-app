import Link from 'next/link'
import Nav from '@/components/Nav'

const methods = [
  {
    href: '/generate/manual',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
      </svg>
    ),
    title: 'Manual Entry',
    desc: 'Fill out a form with your product name, description, image URL, and target audience.',
    badge: 'Fastest',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    href: '/generate/scrape',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    title: 'Scrape a URL',
    desc: 'Paste any product page URL. We extract the title, description, image, and price automatically.',
    badge: 'Smart',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    href: '/generate/import',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Bulk Import',
    desc: 'Upload a CSV or Excel file with multiple products. Generates ad sets for every row.',
    badge: 'Bulk',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
]

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Nav
        crumbs={[{ label: 'Generate' }]}
        action={
          <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            Dashboard
          </Link>
        }
      />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">Generate ad creative</h1>
          <p className="text-zinc-400">Choose how you want to input product information.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {methods.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 rounded-2xl p-6 transition-all hover:bg-zinc-800/50 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-zinc-800 group-hover:bg-zinc-700 rounded-xl text-zinc-300 transition-colors">
                  {m.icon}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${m.badgeColor}`}>
                  {m.badge}
                </span>
              </div>
              <div>
                <div className="font-semibold text-white mb-1.5">{m.title}</div>
                <p className="text-sm text-zinc-400 leading-relaxed">{m.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 text-violet-400 text-sm font-medium mt-auto">
                Get started
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
