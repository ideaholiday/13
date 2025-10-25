import { proxyPOST } from '../../_lib/proxy'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  return proxyPOST(req, '/flights/book')
}
