import { sanityClient } from '@/lib/sanity.client'
import { postBySlugQuery } from '@/lib/sanity.queries'
import PortableBody from '@/components/PortableBody'
import SeoHead from '@/components/SeoHead'

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // If Sanity is disabled, return not found
  if (process.env.DISABLE_SANITY === 'true' || !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return <div>Blog post not found</div>
  }
  
  const post = await sanityClient.fetch(postBySlugQuery, { slug: params.slug })
  if (!post) return <div>Not found</div>
  return (
    <>
      <SeoHead seo={post.seo} />
      <article className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <PortableBody value={post.body} />
      </article>
    </>
  )
}

export async function generateStaticParams() {
  // If Sanity is disabled, return empty array
  if (process.env.DISABLE_SANITY === 'true' || !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return []
  }
  
  try {
    const posts = await sanityClient.fetch(`*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`)
    return posts.map((p: { slug: string }) => ({ slug: p.slug }))
  } catch (error) {
    console.warn('Failed to fetch blog posts from Sanity:', error)
    return []
  }
}

export const revalidate = 60 // seconds
