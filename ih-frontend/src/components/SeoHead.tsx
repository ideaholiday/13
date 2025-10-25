import Head from 'next/head'

export default function SeoHead({ seo }: { seo?: any }) {
  if (!seo) return null
  return (
    <Head>
      {seo.title && <title>{seo.title}</title>}
      {seo.description && <meta name="description" content={seo.description} />}
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      {seo.ogTitle && <meta property="og:title" content={seo.ogTitle} />}
      {seo.ogDescription && <meta property="og:description" content={seo.ogDescription} />}
      {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
    </Head>
  )
}
