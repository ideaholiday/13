"use client"
import React, { useState } from 'react'
import { useForumPosts, useCreateForumPost } from '@/hooks/use-enhancements'
import ForumPostCard from '@/components/shared/ForumPost'
import type { ForumPost } from '@/types/enhancements'

type Category = ForumPost['category']

interface FormState {
  title: string
  content: string
  category: Category
  destination: string
}

export default function ForumPostDemo() {
  const { data: posts, isLoading } = useForumPosts()
  const createPost = useCreateForumPost()
  const [form, setForm] = useState<FormState>({ title: '', content: '', category: 'question', destination: '' })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    await createPost.mutateAsync(form)
    setForm({ title: '', content: '', category: 'question', destination: '' })
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">ForumPost Demo</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <input
          type="text"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-base"
          placeholder="Post title"
          maxLength={80}
          required
        />
        <textarea
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-base min-h-[70px]"
          placeholder="Share your question, tip, or experience"
          maxLength={1000}
          required
        />
        <div className="flex gap-2">
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="question">Question</option>
            <option value="tips">Tips</option>
            <option value="experience">Experience</option>
            <option value="recommendation">Recommendation</option>
          </select>
          <input
            type="text"
            value={form.destination}
            onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
            className="border rounded px-2 py-1 text-sm flex-1"
            placeholder="Destination (optional)"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-60"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? 'Posting...' : 'Post'}
        </button>
      </form>
      {isLoading && <div>Loading posts...</div>}
      {posts && posts.length === 0 && <div>No posts yet.</div>}
      {posts && posts.map((post: ForumPost) => (
        <ForumPostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
