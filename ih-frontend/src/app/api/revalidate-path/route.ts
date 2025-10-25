import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { path } = await req.json()
  if (!path) {
    return NextResponse.json({ message: 'Missing path' }, { status: 400 })
  }
  try {
    // Revalidate the given path
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, secret: process.env.SANITY_REVALIDATE_SECRET }),
    })
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating', error: err }, { status: 500 })
  }
}
