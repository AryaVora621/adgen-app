import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl font-bold mb-4 tracking-tight">AdGen</h1>
      <p className="text-xl text-gray-500 max-w-md mb-10">
        AI-powered ad generation. Static images, copy, and social captions - all in one ZIP.
      </p>
      <div className="flex gap-4">
        <Link
          href="/generate"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Generate Ads
        </Link>
        <Link
          href="/dashboard"
          className="border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
