import { NextRequest, NextResponse } from 'next/server'
import { getUser, getServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const supabase = await getServerSupabase()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('anthropic_api_key, plan')
    .eq('id', user.id)
    .single()

  const key = profile?.anthropic_api_key as string | null | undefined
  return NextResponse.json({
    has_key: !!key,
    key_preview: key ? key.slice(0, 8) + '...' : null,
    plan: profile?.plan ?? 'free',
  })
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json()
  const { anthropic_api_key } = body as { anthropic_api_key?: string }

  if (!anthropic_api_key || typeof anthropic_api_key !== 'string') {
    return NextResponse.json({ error: 'anthropic_api_key is required' }, { status: 400 })
  }

  const supabase = await getServerSupabase()
  const { error } = await supabase
    .from('user_profiles')
    .update({ anthropic_api_key })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to update API key:', error)
    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
