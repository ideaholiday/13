export default {
  name: 'post',
  type: 'document',
  title: 'Post',
  fields: [
    { name: 'title', type: 'string', title: 'Title' },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title', maxLength: 96 } },
    { name: 'excerpt', type: 'text', title: 'Excerpt' },
    { name: 'coverImage', type: 'image', title: 'Cover Image' },
    { name: 'author', type: 'reference', to: [{ type: 'author' }] },
    { name: 'tags', type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] },
    { name: 'publishedAt', type: 'datetime', title: 'Published At' },
    { name: 'body', type: 'array', of: [{ type: 'block' }], title: 'Body' },
    { name: 'seo', type: 'seo', title: 'SEO' }
  ]
}
