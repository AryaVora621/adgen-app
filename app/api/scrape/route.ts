import { NextRequest, NextResponse } from 'next/server'
import { scrapeProductUrl } from '@/lib/scraper'

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const product = await scrapeProductUrl(url)
    return NextResponse.json(product)
  } catch (err) {
    console.error('Scrape error:', err)
    return NextResponse.json(
      { error: 'Failed to scrape URL - try manual entry' },
      { status: 422 }
    )
  }
}
