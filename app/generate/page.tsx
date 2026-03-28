import Link from 'next/link'

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold">Generate Ads</span>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-2">Choose an input method</h1>
          <p className="text-gray-500 text-center mb-10">
            How would you like to provide product information?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/generate/manual"
              className="bg-white border border-gray-200 hover:border-indigo-400 rounded-xl p-6 text-center transition-colors group"
            >
              <div className="text-3xl mb-3">+</div>
              <div className="font-semibold text-gray-900 group-hover:text-indigo-600">
                Manual Entry
              </div>
              <p className="text-sm text-gray-400 mt-1">Fill out a form with your product details</p>
            </Link>

            <Link
              href="/generate/scrape"
              className="bg-white border border-gray-200 hover:border-indigo-400 rounded-xl p-6 text-center transition-colors group"
            >
              <div className="text-3xl mb-3">@</div>
              <div className="font-semibold text-gray-900 group-hover:text-indigo-600">
                Scrape URL
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Paste a product URL and we will auto-fill the details
              </p>
            </Link>

            <Link
              href="/generate/import"
              className="bg-white border border-gray-200 hover:border-indigo-400 rounded-xl p-6 text-center transition-colors group"
            >
              <div className="text-3xl mb-3">#</div>
              <div className="font-semibold text-gray-900 group-hover:text-indigo-600">
                Bulk Import
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Upload a CSV or Excel file with multiple products
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
