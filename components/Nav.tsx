import Link from 'next/link'

interface Crumb {
  label: string
  href?: string
}

interface NavProps {
  crumbs?: Crumb[]
  action?: React.ReactNode
  userEmail?: string
  onSignOut?: () => void
}

export default function Nav({ crumbs, action, userEmail, onSignOut }: NavProps) {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/" className="font-bold text-white tracking-tight">
            AdGen
          </Link>
          {crumbs?.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-zinc-600">/</span>
              {crumb.href ? (
                <Link href={crumb.href} className="text-zinc-400 hover:text-zinc-200 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-zinc-300">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
        {(action || userEmail) && (
          <div className="flex items-center gap-3">
            {action}
            {userEmail && (
              <>
                <Link
                  href="/settings"
                  className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300 hover:border-zinc-500 transition-colors"
                >
                  {userEmail[0].toUpperCase()}
                </Link>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Sign out
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
