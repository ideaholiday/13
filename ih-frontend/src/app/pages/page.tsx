import { sanityClient } from '@/lib/sanity.client'
import { footerLinksQuery } from '@/lib/sanity.queries'
import Link from 'next/link'

export default async function PagesList() {
  const pages = await sanityClient.fetch(footerLinksQuery)

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">All CMS Pages</h1>
      <ul className="space-y-4">
        {pages.map((page: any) => (
          <li key={page._id}>
            <Link href={`/${page.slug}`} className="text-sapphire-700 hover:underline text-lg">
              {page.title}
            </Link>
            {page.footerCategory && (
              <span className="ml-2 text-xs text-slate-500">({page.footerCategory})</span>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
