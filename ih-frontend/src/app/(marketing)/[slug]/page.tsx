import { sanityClient } from '@/lib/sanity.client'
import { pageBySlugQuery } from '@/lib/sanity.queries'
import PortableBody from '@/components/PortableBody'
import SeoHead from '@/components/SeoHead'

export default async function CMSPage({ params }: { params: { slug: string } }) {
  // If Sanity is disabled, return not found
  if (process.env.DISABLE_SANITY === 'true' || !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return <div>Page not found</div>
  }
  
  const page = await sanityClient.fetch(pageBySlugQuery, { slug: params.slug })
  if (!page) return <div>Not found</div>
  return (
    <>
      <SeoHead seo={page.seo} />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
        <PortableBody value={page.body} />
      </main>
    </>
  )
}

export async function generateStaticParams() {
  // If Sanity is disabled, return empty array
  if (process.env.DISABLE_SANITY === 'true' || !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return []
  }
  
  try {
    const pages = await sanityClient.fetch(`*[_type == "page" && defined(slug.current)]{ "slug": slug.current }`)
    return pages.map((p: { slug: string }) => ({ slug: p.slug }))
  } catch (error) {
    console.warn('Failed to fetch pages from Sanity:', error)
    return []
  }
}

export const revalidate = 60 // seconds
