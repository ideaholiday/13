import { proxyGET } from '../../../_lib/proxy'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Recompose path including id
  return proxyGET(req, `/flights/pnr/${encodeURIComponent(params.id)}`)
}
