import { NextRequest, NextResponse } from 'next/server'
import { parseProductFile } from '@/lib/importer'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const products = parseProductFile(buffer)
    if (products.length === 0) {
      return NextResponse.json({ error: 'No rows found in file' }, { status: 422 })
    }
    return NextResponse.json({ products })
  } catch (err) {
    console.error('Import error:', err)
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 422 })
  }
}
