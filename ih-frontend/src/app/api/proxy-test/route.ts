import { NextResponse } from 'next/server';
import { http } from '../../../lib/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const resp = await http.get('https://ipv4.icanhazip.com', { responseType: 'text' });
    const ip = typeof resp.data === 'string' ? resp.data.trim() : String(resp.data).trim();
    return new NextResponse(ip + '\n', { status: 200, headers: { 'content-type': 'text/plain' } });
  } catch (e: any) {
    const msg = e?.message || 'proxy-test failed';
    const code = e?.code || '';
    return new NextResponse(`error: ${msg} ${code}\n`, { status: 500, headers: { 'content-type': 'text/plain' } });
  }
}
