import { proxyGET } from '../../_lib/proxy'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  return proxyGET(req, '/flights/fare-quote')
}
