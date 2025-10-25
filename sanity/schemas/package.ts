export default {
  name: 'package',
  type: 'document',
  title: 'Holiday Package',
  fields: [
    { 
      name: 'title', 
      type: 'string', 
      title: 'Package Title',
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
      name: 'shortDescription', 
      type: 'text', 
      title: 'Short Description',
      description: 'Brief description for cards (max 160 chars)',
      validation: (Rule: any) => Rule.max(160)
    },
    { 
      name: 'description', 
      type: 'text', 
      title: 'Full Description' 
    },
    { 
      name: 'coverImage', 
      type: 'image', 
      title: 'Cover Image',
      options: {
        hotspot: true
      }
    },
    { 
      name: 'images', 
      type: 'array', 
      title: 'Gallery Images',
      of: [{ type: 'image', options: { hotspot: true } }]
    },
    { 
      name: 'destination', 
      type: 'reference', 
      title: 'Destination',
      to: [{ type: 'destination' }],
      validation: (Rule: any) => Rule.required()
    },
    { 
      name: 'duration', 
      type: 'number', 
      title: 'Duration (Days)',
      validation: (Rule: any) => Rule.required().positive().integer()
    },
    { 
      name: 'theme', 
      type: 'array', 
      title: 'Themes',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Adventure', value: 'adventure' },
          { title: 'Beach', value: 'beach' },
          { title: 'Culture', value: 'culture' },
          { title: 'Romance', value: 'romance' },
          { title: 'Family', value: 'family' },
          { title: 'City Break', value: 'city' },
          { title: 'Luxury', value: 'luxury' },
          { title: 'Budget', value: 'budget' }
        ]
      }
    },
    { 
      name: 'difficulty', 
      type: 'string', 
      title: 'Difficulty Level',
      options: {
        list: [
          { title: 'Easy', value: 'easy' },
          { title: 'Moderate', value: 'moderate' },
          { title: 'Challenging', value: 'challenging' }
        ]
      }
    },
    {
      name: 'groupSize',
      type: 'object',
      title: 'Group Size',
      fields: [
        { name: 'min', type: 'number', title: 'Minimum', validation: (Rule: any) => Rule.required().positive() },
        { name: 'max', type: 'number', title: 'Maximum', validation: (Rule: any) => Rule.required().positive() }
      ]
    },
    {
      name: 'pricing',
      type: 'object',
      title: 'Pricing',
      fields: [
        { name: 'basePrice', type: 'number', title: 'Base Price', validation: (Rule: any) => Rule.required().positive() },
        { name: 'currency', type: 'string', title: 'Currency', initialValue: 'INR' },
        { name: 'pricePerPerson', type: 'boolean', title: 'Price Per Person', initialValue: true },
        { name: 'childDiscount', type: 'number', title: 'Child Discount (%)', validation: (Rule: any) => Rule.min(0).max(100) }
      ]
    },
    { 
      name: 'inclusions', 
      type: 'array', 
      title: 'Inclusions',
      of: [{ type: 'string' }]
    },
    { 
      name: 'exclusions', 
      type: 'array', 
      title: 'Exclusions',
      of: [{ type: 'string' }]
    },
    {
      name: 'itinerary',
      type: 'array',
      title: 'Itinerary',
      of: [{
        type: 'object',
        fields: [
          { name: 'day', type: 'number', title: 'Day' },
          { name: 'title', type: 'string', title: 'Day Title' },
          { name: 'description', type: 'text', title: 'Description' },
          { name: 'activities', type: 'array', of: [{ type: 'string' }], title: 'Activities' },
          { name: 'meals', type: 'array', of: [{ type: 'string' }], title: 'Meals' },
          { name: 'accommodation', type: 'string', title: 'Accommodation' },
          { name: 'transportation', type: 'string', title: 'Transportation' }
        ]
      }]
    },
    { 
      name: 'highlights', 
      type: 'array', 
      title: 'Highlights',
      of: [{ type: 'string' }]
    },
    { 
      name: 'rating', 
      type: 'number', 
      title: 'Rating',
      validation: (Rule: any) => Rule.min(0).max(5)
    },
    { 
      name: 'reviewCount', 
      type: 'number', 
      title: 'Review Count',
      initialValue: 0
    },
    { 
      name: 'available', 
      type: 'boolean', 
      title: 'Available for Booking',
      initialValue: true
    },
    { 
      name: 'departureDates', 
      type: 'array', 
      title: 'Departure Dates',
      of: [{ type: 'datetime' }]
    },
    { 
      name: 'featured', 
      type: 'boolean', 
      title: 'Featured Package',
      initialValue: false
    },
    { 
      name: 'deals', 
      type: 'array', 
      title: 'Related Deals',
      of: [{ type: 'reference', to: [{ type: 'deal' }] }]
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
      destination: 'destination.title',
      media: 'coverImage'
    },
    prepare(selection: any) {
      const { title, destination, media } = selection
      return {
        title: title,
        subtitle: destination || 'No destination',
        media: media
      }
    }
  }
}
