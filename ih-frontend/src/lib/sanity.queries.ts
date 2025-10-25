import groq from 'groq'

// Blog Posts
export const postsQuery = groq`*[_type == "post"] | order(publishedAt desc){
  _id,
  title,
  slug,
  excerpt,
  "coverImage": coverImage.asset->url,
  publishedAt,
  tags[]->{title, slug},
  author->{name, "image": image.asset->url},
  seo
}`

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  excerpt,
  "coverImage": coverImage.asset->url,
  publishedAt,
  tags[]->{title, slug},
  author->{name, "image": image.asset->url},
  body,
  seo
}`

// Pages
export const pageBySlugQuery = groq`*[_type == "page" && slug.current == $slug][0]{
  _id, title, slug, body, hero, seo
}`

// Footer links: fetch all pages with showInFooter true, grouped by footerCategory
export const footerLinksQuery = groq`
  *[_type == "page" && showInFooter == true]{
    _id,
    title,
    "slug": slug.current,
    footerCategory
  }
`

// Destinations
export const destinationsQuery = groq`*[_type == "destination"] | order(isPopular desc, title asc){
  _id,
  title,
  "slug": slug.current,
  country,
  description,
  "image": image.asset->url,
  "gallery": gallery[].asset->url,
  isPopular,
  averagePrice,
  bestTime,
  highlights,
  climate,
  "packageCount": count(*[_type == "package" && references(^._id)]),
  seo
}`

export const destinationBySlugQuery = groq`*[_type == "destination" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  country,
  description,
  "image": image.asset->url,
  "gallery": gallery[].asset->url,
  isPopular,
  averagePrice,
  bestTime,
  highlights,
  climate,
  "packages": *[_type == "package" && references(^._id)]{
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    "coverImage": coverImage.asset->url,
    duration,
    theme,
    pricing,
    rating,
    reviewCount,
    featured
  },
  seo
}`

// Deals & Offers
export const dealsQuery = groq`*[_type == "deal" && active == true && validTill > now()] | order(featured desc, validTill asc){
  _id,
  title,
  "slug": slug.current,
  description,
  "image": image.asset->url,
  discountPercent,
  discountAmount,
  originalPrice,
  offerPrice,
  validFrom,
  validTill,
  dealType,
  featured,
  termsAndConditions,
  "relatedPackages": relatedPackages[]->{
    _id,
    title,
    "slug": slug.current,
    "coverImage": coverImage.asset->url,
    pricing
  },
  seo
}`

export const dealBySlugQuery = groq`*[_type == "deal" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  description,
  "image": image.asset->url,
  discountPercent,
  discountAmount,
  originalPrice,
  offerPrice,
  validFrom,
  validTill,
  dealType,
  featured,
  active,
  termsAndConditions,
  "relatedPackages": relatedPackages[]->{
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    "coverImage": coverImage.asset->url,
    duration,
    theme,
    pricing,
    rating,
    reviewCount
  },
  seo
}`

export const featuredDealsQuery = groq`*[_type == "deal" && featured == true && active == true && validTill > now()] | order(validTill asc)[0...6]{
  _id,
  title,
  "slug": slug.current,
  description,
  "image": image.asset->url,
  discountPercent,
  discountAmount,
  validTill,
  dealType
}`

// Packages
export const packagesQuery = groq`*[_type == "package" && available == true] | order(featured desc, rating desc){
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  "coverImage": coverImage.asset->url,
  "images": images[].asset->url,
  "destination": destination->{
    _id,
    title,
    "slug": slug.current,
    country
  },
  duration,
  theme,
  difficulty,
  groupSize,
  pricing,
  highlights,
  rating,
  reviewCount,
  featured,
  "deals": deals[]->{
    _id,
    title,
    "slug": slug.current,
    discountPercent,
    validTill
  }
}`

export const packageBySlugQuery = groq`*[_type == "package" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  description,
  shortDescription,
  "coverImage": coverImage.asset->url,
  "images": images[].asset->url,
  "destination": destination->{
    _id,
    title,
    "slug": slug.current,
    country,
    description,
    "image": image.asset->url
  },
  duration,
  theme,
  difficulty,
  groupSize,
  pricing,
  inclusions,
  exclusions,
  itinerary,
  highlights,
  rating,
  reviewCount,
  available,
  departureDates,
  "deals": deals[]->{
    _id,
    title,
    "slug": slug.current,
    description,
    "image": image.asset->url,
    discountPercent,
    discountAmount,
    validTill
  },
  seo
}`

export const featuredPackagesQuery = groq`*[_type == "package" && featured == true && available == true] | order(rating desc)[0...6]{
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  "coverImage": coverImage.asset->url,
  "destination": destination->title,
  duration,
  theme,
  pricing,
  rating,
  reviewCount
}`

// Packages by destination
export const packagesByDestinationQuery = groq`*[_type == "package" && available == true && destination->slug.current == $destinationSlug] | order(rating desc){
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  "coverImage": coverImage.asset->url,
  duration,
  theme,
  pricing,
  rating,
  reviewCount,
  featured
}`

// Packages by theme
export const packagesByThemeQuery = groq`*[_type == "package" && available == true && $theme in theme] | order(rating desc){
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  "coverImage": coverImage.asset->url,
  "destination": destination->title,
  duration,
  theme,
  pricing,
  rating,
  reviewCount
}`
