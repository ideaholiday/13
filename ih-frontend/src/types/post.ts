export interface Post {
  _id: string
  title: string
  slug: string
  excerpt?: string
  body: any
  publishedAt?: string
  seo?: any
}
