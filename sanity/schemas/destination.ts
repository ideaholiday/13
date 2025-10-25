export default {
  name: 'destination',
  type: 'document',
  title: 'Destination',
  fields: [
    { 
      name: 'title', 
      type: 'string', 
      title: 'Destination Name',
      validation: (Rule: any) => Rule.required()
    },
    { 
      name: 'slug', 
      type: 'slug', 
      title: 'Slug', 
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required()
    },
    { 
      name: 'country', 
      type: 'string', 
      title: 'Country',
      validation: (Rule: any) => Rule.required()
    },
    { 
      name: 'description', 
      type: 'text', 
      title: 'Description' 
    },
    { 
      name: 'image', 
      type: 'image', 
      title: 'Cover Image',
      options: {
        hotspot: true
      }
    },
    { 
      name: 'gallery', 
      type: 'array', 
      title: 'Gallery Images',
      of: [{ type: 'image', options: { hotspot: true } }]
    },
    { 
      name: 'isPopular', 
      type: 'boolean', 
      title: 'Popular Destination',
      initialValue: false
    },
    { 
      name: 'averagePrice', 
      type: 'number', 
      title: 'Average Package Price',
      description: 'Used for display purposes'
    },
    { 
      name: 'bestTime', 
      type: 'string', 
      title: 'Best Time to Visit',
      description: 'e.g., "November to March"'
    },
    { 
      name: 'highlights', 
      type: 'array', 
      title: 'Highlights',
      of: [{ type: 'string' }]
    },
    { 
      name: 'climate', 
      type: 'text', 
      title: 'Climate Information' 
    },
    { 
      name: 'seo', 
      type: 'seo', 
      title: 'SEO' 
    }
  ],
  preview: {
    select: {
      title: 'title',
      country: 'country',
      media: 'image'
    },
    prepare(selection: any) {
      const { title, country, media } = selection
      return {
        title: title,
        subtitle: country || 'No country specified',
        media: media
      }
    }
  }
}
