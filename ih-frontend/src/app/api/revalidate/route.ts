import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { secret, path } = await req.json()
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    })
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating', error: err }, { status: 500 })
  }
}
