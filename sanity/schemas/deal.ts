export default {
  name: 'deal',
  type: 'document',
  title: 'Deal / Offer',
  fields: [
    { 
      name: 'title', 
      type: 'string', 
      title: 'Deal Title',
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
      name: 'description', 
      type: 'text', 
      title: 'Description' 
    },
    { 
      name: 'image', 
      type: 'image', 
      title: 'Deal Image',
      options: {
        hotspot: true
      }
    },
    { 
      name: 'discountPercent', 
      type: 'number', 
      title: 'Discount Percentage',
      description: 'e.g., 20 for 20% off',
      validation: (Rule: any) => Rule.min(0).max(100)
    },
    { 
      name: 'discountAmount', 
      type: 'number', 
      title: 'Discount Amount',
      description: 'Fixed discount amount (alternative to percentage)'
    },
    { 
      name: 'originalPrice', 
      type: 'number', 
      title: 'Original Price' 
    },
    { 
      name: 'offerPrice', 
      type: 'number', 
      title: 'Offer Price' 
    },
    { 
      name: 'validFrom', 
      type: 'datetime', 
      title: 'Valid From',
      initialValue: () => new Date().toISOString()
    },
    { 
      name: 'validTill', 
      type: 'datetime', 
      title: 'Valid Till',
      validation: (Rule: any) => Rule.required()
    },
    { 
      name: 'dealType', 
      type: 'string', 
      title: 'Deal Type',
      options: {
        list: [
          { title: 'Flight Deal', value: 'flight' },
          { title: 'Hotel Deal', value: 'hotel' },
          { title: 'Package Deal', value: 'package' },
          { title: 'General Offer', value: 'general' }
        ]
      }
    },
    { 
      name: 'relatedPackages', 
      type: 'array', 
      title: 'Related Packages',
      of: [{ type: 'reference', to: [{ type: 'package' }] }]
    },
    { 
      name: 'termsAndConditions', 
      type: 'text', 
      title: 'Terms & Conditions' 
    },
    { 
      name: 'featured', 
      type: 'boolean', 
      title: 'Featured Deal',
      initialValue: false
    },
    { 
      name: 'active', 
      type: 'boolean', 
      title: 'Active',
      description: 'Manually control if deal is visible',
      initialValue: true
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
      discount: 'discountPercent',
      media: 'image',
      validTill: 'validTill'
    },
    prepare(selection: any) {
      const { title, discount, media, validTill } = selection
      const discountText = discount ? `${discount}% OFF` : 'Special Offer'
      const expiryDate = validTill ? new Date(validTill).toLocaleDateString() : ''
      return {
        title: title,
        subtitle: `${discountText}${expiryDate ? ` - Expires: ${expiryDate}` : ''}`,
        media: media
      }
    }
  }
}
