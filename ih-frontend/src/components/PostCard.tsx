import Link from 'next/link'
import { Post } from '@/types/post'

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="rounded-lg border p-4 shadow hover:shadow-lg transition">
      <Link href={`/blog/${post.slug}`}
        className="block text-xl font-semibold mb-2 hover:text-primary">
        {post.title}
      </Link>
      <p className="text-gray-600 mb-2">{post.excerpt}</p>
      <div className="text-xs text-gray-400">{post.publishedAt && new Date(post.publishedAt).toLocaleDateString()}</div>
    </div>
  )
}
