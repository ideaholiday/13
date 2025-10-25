/**
 * Sanity Content Revalidation Webhook
 * 
 * This endpoint is called by Sanity webhooks when content is updated.
 * It triggers Next.js ISR revalidation for the updated content.
 * 
 * Setup in Sanity Studio:
 * 1. Go to Manage > API > Webhooks
 * 2. Create new webhook with URL: https://yourdomain.com/api/sanity/revalidate
 * 3. Add secret: SANITY_REVALIDATE_SECRET from .env
 * 4. Select triggers: Create, Update, Delete for post, page, destination, deal, package
 * 
 * Example webhook payload from Sanity:
 * {
 *   "_type": "package",
 *   "_id": "abc123",
 *   "slug": { "current": "dubai-luxury-escape" }
 * }
 */

import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify secret
    const secret = request.headers.get('x-sanity-signature') || request.nextUrl.searchParams.get('secret')
    
    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    // Parse webhook payload
    const body = await request.json()
    const { _type, slug } = body

    console.log('[Sanity Revalidate] Received webhook:', { _type, slug: slug?.current })

    // Revalidate based on content type
    switch (_type) {
      case 'package':
        // Revalidate package listing page
        revalidatePath('/packages')
        
        // Revalidate specific package page if slug exists
        if (slug?.current) {
          revalidatePath(`/packages/${slug.current}`)
          console.log(`[Sanity Revalidate] Revalidated /packages/${slug.current}`)
        }
        
        // Revalidate home page (may show featured packages)
        revalidatePath('/')
        
        console.log('[Sanity Revalidate] Revalidated package pages')
        break

      case 'destination':
        // Revalidate destinations page
        revalidatePath('/destinations')
        
        if (slug?.current) {
          revalidatePath(`/destinations/${slug.current}`)
          console.log(`[Sanity Revalidate] Revalidated /destinations/${slug.current}`)
        }
        
        // Destinations may affect packages
        revalidatePath('/packages')
        revalidatePath('/')
        
        console.log('[Sanity Revalidate] Revalidated destination pages')
        break

      case 'deal':
        // Revalidate deals/offers page
        revalidatePath('/deals')
        revalidatePath('/offers')
        
        if (slug?.current) {
          revalidatePath(`/deals/${slug.current}`)
          console.log(`[Sanity Revalidate] Revalidated /deals/${slug.current}`)
        }
        
        // Deals may affect packages and home page
        revalidatePath('/packages')
        revalidatePath('/')
        
        console.log('[Sanity Revalidate] Revalidated deal pages')
        break

      case 'post':
        // Revalidate blog pages
        revalidatePath('/blog')
        
        if (slug?.current) {
          revalidatePath(`/blog/${slug.current}`)
          console.log(`[Sanity Revalidate] Revalidated /blog/${slug.current}`)
        }
        
        console.log('[Sanity Revalidate] Revalidated blog pages')
        break

      case 'page':
        // Revalidate CMS pages
        if (slug?.current) {
          revalidatePath(`/${slug.current}`)
          console.log(`[Sanity Revalidate] Revalidated /${slug.current}`)
        }
        
        // CMS pages may affect footer
        revalidatePath('/')
        
        console.log('[Sanity Revalidate] Revalidated CMS pages')
        break

      default:
        // Unknown content type - revalidate home page as fallback
        revalidatePath('/')
        console.log(`[Sanity Revalidate] Unknown type ${_type}, revalidated home page`)
    }

    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      type: _type,
      slug: slug?.current 
    })
  } catch (err: any) {
    console.error('[Sanity Revalidate] Error:', err)
    return NextResponse.json({ 
      message: 'Error revalidating', 
      error: err.message 
    }, { status: 500 })
  }
}

// Allow GET for testing
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  // Test revalidation
  revalidatePath('/')
  revalidatePath('/packages')
  revalidatePath('/blog')
  
  return NextResponse.json({ 
    message: 'Test revalidation triggered',
    paths: ['/', '/packages', '/blog'],
    timestamp: Date.now()
  })
}
