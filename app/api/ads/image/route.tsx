import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const format = searchParams.get('format') || 'square'
  const headline = searchParams.get('headline') || 'Your Headline Here'
  const body = searchParams.get('body') || ''
  const cta = searchParams.get('cta') || 'Shop Now'
  const brandColor = searchParams.get('brandColor') || '#6366f1'
  const productImage = searchParams.get('productImage') || ''

  const sizes: Record<string, { width: number; height: number }> = {
    square: { width: 1080, height: 1080 },
    story: { width: 1080, height: 1920 },
    banner: { width: 1200, height: 628 },
  }

  const { width, height } = sizes[format] || sizes.square

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            backgroundColor: brandColor,
            display: 'flex',
          }}
        />

        {/* Product image */}
        {productImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={productImage}
            alt=""
            style={{
              width: format === 'story' ? '70%' : '50%',
              height: format === 'story' ? '45%' : '50%',
              objectFit: 'contain',
              marginBottom: '40px',
            }}
          />
        )}

        {/* Copy block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0 80px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: format === 'banner' ? '52px' : '72px',
              fontWeight: 800,
              color: '#111827',
              lineHeight: 1.1,
              marginBottom: '24px',
              fontFamily: 'sans-serif',
            }}
          >
            {headline}
          </div>
          {body && (
            <div
              style={{
                fontSize: format === 'banner' ? '28px' : '36px',
                color: '#6b7280',
                marginBottom: '40px',
                fontFamily: 'sans-serif',
                maxWidth: '800px',
              }}
            >
              {body}
            </div>
          )}
          <div
            style={{
              backgroundColor: brandColor,
              color: '#ffffff',
              fontSize: format === 'banner' ? '28px' : '36px',
              fontWeight: 700,
              padding: format === 'banner' ? '18px 48px' : '24px 64px',
              borderRadius: '12px',
              fontFamily: 'sans-serif',
            }}
          >
            {cta}
          </div>
        </div>
      </div>
    ),
    { width, height }
  )
}
