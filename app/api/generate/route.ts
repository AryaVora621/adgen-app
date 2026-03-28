import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { generateAdCopy } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    business_name,
    business_website,
    brand_color = '#6366f1',
    product_name,
    product_description,
    product_image_url,
    product_price,
    target_audience,
    input_method = 'manual',
  } = body

  if (!business_name || !product_name || !product_description) {
    return NextResponse.json(
      { error: 'business_name, product_name, and product_description are required' },
      { status: 400 }
    )
  }

  const supabase = getSupabase()

  // Upsert business
  let businessId: string
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('name', business_name)
    .limit(1)
    .single()

  if (existing) {
    businessId = existing.id
  } else {
    const { data: newBiz, error: bizError } = await supabase
      .from('businesses')
      .insert({ name: business_name, website: business_website, brand_color })
      .select('id')
      .single()
    if (bizError || !newBiz) {
      console.error('Business insert error:', bizError)
      return NextResponse.json({ error: 'Failed to create business', detail: bizError?.message }, { status: 500 })
    }
    businessId = newBiz.id
  }

  // Insert product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      business_id: businessId,
      name: product_name,
      description: product_description,
      image_url: product_image_url,
      price: product_price,
      target_audience,
      input_method,
    })
    .select('id')
    .single()

  if (productError || !product) {
    console.error('Product insert error:', productError)
    return NextResponse.json({ error: 'Failed to save product', detail: productError?.message }, { status: 500 })
  }

  // Generate copy with Claude
  let copy
  try {
    copy = await generateAdCopy({
      name: product_name,
      description: product_description,
      price: product_price,
      target_audience,
      brand_color,
    })
  } catch (err) {
    console.error('Claude error:', err)
    return NextResponse.json({ error: 'Failed to generate ad copy', detail: String(err) }, { status: 500 })
  }

  // Build image URLs (Satori renders on demand via edge function)
  const baseImageUrl = `${req.nextUrl.origin}/api/ads/image`
  const imageParams = new URLSearchParams({
    headline: copy.headline,
    body: copy.body,
    cta: copy.cta,
    brandColor: brand_color,
    ...(product_image_url ? { productImage: product_image_url } : {}),
  })

  // Create ad set
  const { data: adSet, error: adSetError } = await supabase
    .from('ad_sets')
    .insert({ product_id: product.id, business_id: businessId })
    .select('id')
    .single()

  if (adSetError || !adSet) {
    return NextResponse.json({ error: 'Failed to create ad set' }, { status: 500 })
  }

  // Insert ads for all formats
  const formats = ['square', 'story', 'banner'] as const
  const adRows = formats.map((format) => ({
    ad_set_id: adSet.id,
    business_id: businessId,
    format,
    copy_json: { headline: copy.headline, body: copy.body, cta: copy.cta },
    image_url: `${baseImageUrl}?${imageParams.toString()}&format=${format}`,
    platform: format === 'square' ? 'instagram' : format === 'story' ? 'instagram' : 'facebook',
  }))

  // Insert social copy ads
  const socialRows = [
    {
      ad_set_id: adSet.id,
      business_id: businessId,
      format: 'social_instagram',
      copy_json: { caption: copy.instagram_caption },
      platform: 'instagram',
    },
    {
      ad_set_id: adSet.id,
      business_id: businessId,
      format: 'social_twitter',
      copy_json: { caption: copy.twitter_caption },
      platform: 'twitter',
    },
    {
      ad_set_id: adSet.id,
      business_id: businessId,
      format: 'social_linkedin',
      copy_json: { caption: copy.linkedin_caption },
      platform: 'linkedin',
    },
  ]

  const { error: adsError } = await supabase
    .from('ads')
    .insert([...adRows, ...socialRows])

  if (adsError) {
    return NextResponse.json({ error: 'Failed to save ads' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    ad_set_id: adSet.id,
    business_id: businessId,
    copy,
    image_urls: Object.fromEntries(
      formats.map((f) => [f, `${baseImageUrl}?${imageParams.toString()}&format=${f}`])
    ),
  })
}
