export default {
  name: 'tag',
  type: 'document',
  title: 'Tag',
  fields: [
    { name: 'title', type: 'string', title: 'Title' },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title', maxLength: 96 } }
  ]
}
