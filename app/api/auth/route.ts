import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const expected = process.env.DASHBOARD_PASSWORD ?? 'adgen2024'

  if (password !== expected) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('adgen_auth', expected, {
    httpOnly: true,
    path: '/',
  })
  return res
}
