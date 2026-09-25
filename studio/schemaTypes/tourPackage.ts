import {defineField, defineType} from 'sanity'

export const tourPackage = defineType({
  name: 'tourPackage',
  title: 'Package',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Religious', value: 'religious'},
          {title: 'Wildlife', value: 'wildlife'},
          {title: 'Adventure', value: 'adventure'},
          {title: 'Specialist', value: 'specialist'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'durationBand',
      title: 'Duration band',
      type: 'string',
      options: {
        list: [
          {title: 'Short', value: 'short'},
          {title: 'Medium', value: 'medium'},
          {title: 'Extended', value: 'extended'},
        ],
      },
    }),
    defineField({name: 'durationLabel', title: 'Duration label', type: 'string'}),
    defineField({name: 'price', title: 'Starting price (USD)', type: 'number', validation: (rule) => rule.required().min(0)}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3}),
    defineField({name: 'badge', title: 'Badge', type: 'string'}),
    defineField({name: 'highlight', title: 'Highlight chip', type: 'string'}),
    defineField({name: 'inclusions', title: 'Inclusions', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'image', title: 'Image', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'imageUrl',
      title: 'Image URL',
      type: 'url',
      description: 'Used on the website until an image is uploaded above.',
    }),
    defineField({name: 'imageAlt', title: 'Image description', type: 'text', rows: 2}),
    defineField({
      name: 'bookingTrack',
      title: 'Booking track',
      type: 'string',
      options: {
        list: [
          {title: 'Pilgrimage', value: 'pilgrimage'},
          {title: 'Safari', value: 'safari'},
        ],
      },
    }),
    defineField({name: 'bookingPackage', title: 'Booking package value', type: 'string'}),
    defineField({name: 'bookingNote', title: 'Booking note', type: 'text', rows: 2}),
    defineField({name: 'sortOrder', title: 'Sort order', type: 'number'}),
  ],
  orderings: [
    {title: 'Sort order', name: 'sortOrder', by: [{field: 'sortOrder', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', category: 'category', price: 'price', media: 'image'},
    prepare: ({title, category, price, media}) => ({
      title,
      subtitle: [category, price ? `$${price}` : ''].filter(Boolean).join(' · '),
      media,
    }),
  },
})
