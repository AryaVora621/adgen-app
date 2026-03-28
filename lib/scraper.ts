import * as cheerio from 'cheerio'

export interface ScrapedProduct {
  name: string
  description: string
  image_url: string
  price: string
}

export async function scrapeProductUrl(url: string): Promise<ScrapedProduct> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; AdGenBot/1.0; +https://adgen.app)',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.status}`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)

  const name =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() ||
    ''

  const description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    ''

  const image_url =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    ''

  // try to find a price - common patterns
  const priceSelectors = [
    '[itemprop="price"]',
    '.price',
    '#price',
    '[class*="price"]',
    '[data-price]',
  ]
  let price = ''
  for (const sel of priceSelectors) {
    const el = $(sel).first()
    if (el.length) {
      price = el.attr('content') || el.text().trim()
      break
    }
  }

  return {
    name: name.trim(),
    description: description.trim(),
    image_url: image_url.trim(),
    price: price.trim(),
  }
}
