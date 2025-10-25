import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  draftMode().enable()
  const { searchParams } = new URL(request.url)
  const redirect = searchParams.get('redirect') || '/'
  return NextResponse.redirect(redirect)
}
