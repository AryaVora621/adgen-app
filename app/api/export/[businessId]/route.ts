import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import JSZip from 'jszip'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const supabase = getSupabase()
  const { businessId } = await params

  // Fetch business
  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('id', businessId)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Fetch all ads with their product info
  const { data: ads } = await supabase
    .from('ads')
    .select('*, ad_sets(product_id, products(name))')
    .eq('business_id', businessId)

  if (!ads || ads.length === 0) {
    return NextResponse.json({ error: 'No ads found for this business' }, { status: 404 })
  }

  const zip = new JSZip()
  const bizFolder = zip.folder(business.name) as JSZip

  // Group by product
  const byProduct = new Map<string, typeof ads>()
  for (const ad of ads) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productName = (ad.ad_sets as any)?.products?.name || 'unknown'
    if (!byProduct.has(productName)) byProduct.set(productName, [])
    byProduct.get(productName)!.push(ad)
  }

  for (const [productName, productAds] of byProduct.entries()) {
    const productFolder = bizFolder.folder(productName) as JSZip

    // Build copy.txt
    const copyAds = productAds.filter((a) =>
      ['social_instagram', 'social_twitter', 'social_linkedin'].includes(a.format)
    )
    const imageAds = productAds.filter((a) =>
      ['square', 'story', 'banner'].includes(a.format)
    )

    // Add image URLs as a reference file (actual rendering is on-demand via edge)
    const imageRef = imageAds
      .map((a) => `${a.format.toUpperCase()}: ${a.image_url}`)
      .join('\n')
    productFolder.file('image_urls.txt', imageRef)

    // Add copy text
    const copyText = copyAds
      .map((a) => {
        const cap = (a.copy_json as { caption?: string })?.caption || ''
        return `${a.format.replace('social_', '').toUpperCase()}:\n${cap}`
      })
      .join('\n\n---\n\n')

    const imageAdCopy = imageAds[0]?.copy_json as {
      headline?: string
      body?: string
      cta?: string
    } | null

    const fullCopy = [
      imageAdCopy
        ? `AD COPY:\nHeadline: ${imageAdCopy.headline}\nBody: ${imageAdCopy.body}\nCTA: ${imageAdCopy.cta}`
        : '',
      copyText ? `\nSOCIAL CAPTIONS:\n${copyText}` : '',
    ]
      .filter(Boolean)
      .join('\n\n')

    productFolder.file('copy.txt', fullCopy)

    // Try to download and embed the square image
    if (imageAds.length > 0 && imageAds[0].image_url) {
      try {
        const imgRes = await fetch(imageAds[0].image_url, {
          signal: AbortSignal.timeout(15000),
        })
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer()
          productFolder.file('square_1080x1080.png', buf)
        }
      } catch {
        // Non-fatal - image URL still in image_urls.txt
      }
    }
  }

  const zipUint8 = await zip.generateAsync({ type: 'uint8array' })
  const safeName = business.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()

  return new Response(zipUint8.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${safeName}_ads.zip"`,
    },
  })
}
