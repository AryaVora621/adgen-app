import Anthropic from '@anthropic-ai/sdk'

export interface AdCopy {
  headline: string
  subheadline: string
  body: string
  cta: string
  instagram_caption: string
  twitter_caption: string
  linkedin_caption: string
}

export async function generateAdCopy(product: {
  name: string
  description: string
  price?: string
  target_audience?: string
  brand_color?: string
}, apiKey?: string): Promise<AdCopy> {
  // Initialize client inline so the caller can supply a per-user key
  const client = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY })
  const prompt = `You are an expert advertising copywriter. Generate compelling ad copy for this product.

Product: ${product.name}
Description: ${product.description}
${product.price ? `Price: ${product.price}` : ''}
${product.target_audience ? `Target audience: ${product.target_audience}` : ''}

Return ONLY valid JSON with these exact fields (no markdown, no extra text):
{
  "headline": "short punchy headline under 10 words",
  "subheadline": "supporting headline under 15 words",
  "body": "1-2 sentence body copy explaining the value proposition",
  "cta": "call to action button text, 2-4 words",
  "instagram_caption": "instagram caption with relevant hashtags, under 150 chars",
  "twitter_caption": "tweet under 240 chars, no hashtags",
  "linkedin_caption": "professional linkedin caption under 300 chars"
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(text) as AdCopy
}
