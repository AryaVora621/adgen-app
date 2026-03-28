import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { generateAdCopy } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { ad_set_id, product_id, brand_color = '#6366f1' } = body

  if (!ad_set_id || !product_id) {
    return NextResponse.json(
      { error: 'ad_set_id and product_id are required' },
      { status: 400 }
    )
  }

  const supabase = getSupabase()

  // Fetch the product fields needed for copy generation
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('name, description, price, target_audience, image_url')
    .eq('id', product_id)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found', detail: productError?.message }, { status: 404 })
  }

  // Regenerate copy with Claude
  let copy
  try {
    copy = await generateAdCopy({
      name: product.name,
      description: product.description,
      price: product.price,
      target_audience: product.target_audience,
      brand_color,
    })
  } catch (err) {
    console.error('Claude error:', err)
    return NextResponse.json({ error: 'Failed to generate ad copy', detail: String(err) }, { status: 500 })
  }

  // Build image URL params - same pattern as generate route
  const baseImageUrl = `${req.nextUrl.origin}/api/ads/image`
  const imageParams = new URLSearchParams({
    headline: copy.headline,
    body: copy.body,
    cta: copy.cta,
    brandColor: brand_color,
    ...(product.image_url ? { productImage: product.image_url } : {}),
  })

  // Update image ads (square, story, banner) with new copy and image URLs
  const { error: imageAdsError } = await supabase
    .from('ads')
    .update({
      copy_json: { headline: copy.headline, body: copy.body, cta: copy.cta },
      image_url: null, // will be set per-format below via individual updates
    })
    .eq('ad_set_id', ad_set_id)
    .in('format', ['square', 'story', 'banner'])

  if (imageAdsError) {
    return NextResponse.json({ error: 'Failed to update image ads', detail: imageAdsError.message }, { status: 500 })
  }

  // Update each image format with its specific image_url
  const formats = ['square', 'story', 'banner'] as const
  for (const format of formats) {
    await supabase
      .from('ads')
      .update({
        copy_json: { headline: copy.headline, body: copy.body, cta: copy.cta },
        image_url: `${baseImageUrl}?${imageParams.toString()}&format=${format}`,
      })
      .eq('ad_set_id', ad_set_id)
      .eq('format', format)
  }

  // Update social ads with new captions
  const socialUpdates: Array<{ format: string; caption: string }> = [
    { format: 'social_instagram', caption: copy.instagram_caption },
    { format: 'social_twitter', caption: copy.twitter_caption },
    { format: 'social_linkedin', caption: copy.linkedin_caption },
  ]

  for (const { format, caption } of socialUpdates) {
    await supabase
      .from('ads')
      .update({ copy_json: { caption } })
      .eq('ad_set_id', ad_set_id)
      .eq('format', format)
  }

  return NextResponse.json({ success: true, copy })
}
