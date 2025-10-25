import { NextResponse } from 'next/server';
import { http } from '../../../lib/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const resp = await http.get('https://tboapi.travelboutiqueonline.com/', { validateStatus: () => true });
    return NextResponse.json({ status: resp.status, headers: resp.headers }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'tbo check failed', code: e?.code || '' }, { status: 500 });
  }
}
