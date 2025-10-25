export default {
  name: 'page',
  type: 'document',
  title: 'Page',
  fields: [
    { name: 'title', type: 'string', title: 'Title' },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title', maxLength: 96 } },
    { name: 'body', type: 'array', of: [{ type: 'block' }], title: 'Body' },
    { name: 'hero', type: 'image', title: 'Hero Image', options: { hotspot: true } },
    { name: 'seo', type: 'seo', title: 'SEO' },
    { name: 'showInFooter', type: 'boolean', title: 'Show in Footer?' },
    { name: 'footerCategory', type: 'string', title: 'Footer Category',
      options: {
        list: [
          { title: 'Company', value: 'company' },
          { title: 'Services', value: 'services' },
          { title: 'Support', value: 'support' },
          { title: 'Legal', value: 'legal' }
        ]
      }
    }
  ]
}
