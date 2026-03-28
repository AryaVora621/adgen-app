import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Use in Route Handlers and Server Components
export async function getServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// Returns the authenticated user or null
export async function getUser() {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Returns user profile (anthropic_api_key, plan, etc.)
export async function getUserProfile(userId: string) {
  const supabase = await getServerSupabase()
  const { data } = await supabase
    .from('user_profiles')
    .select('anthropic_api_key, plan, stripe_customer_id')
    .eq('id', userId)
    .single()
  return data
}
