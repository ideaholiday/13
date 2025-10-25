import { sanityClient } from '@/lib/sanity.client'
import { postBySlugQuery } from '@/lib/sanity.queries'
import PortableBody from '@/components/PortableBody'
import SeoHead from '@/components/SeoHead'

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
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
  const posts = await sanityClient.fetch(`*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`)
  return posts.map((p: { slug: string }) => ({ slug: p.slug }))
}

export const revalidate = 60 // seconds
