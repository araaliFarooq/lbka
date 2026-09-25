import {defineField, defineType} from 'sanity'

export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Gallery item',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Pilgrimage', value: 'pilgrimage'},
          {title: 'Safari', value: 'safari'},
          {title: 'Leisure', value: 'leisure'},
          {title: 'Community', value: 'community'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'location', title: 'Location', type: 'string'}),
    defineField({name: 'caption', title: 'Caption', type: 'text', rows: 3}),
    defineField({name: 'image', title: 'Image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'imageUrl', title: 'Image URL', type: 'url'}),
    defineField({name: 'imageAlt', title: 'Image description', type: 'text', rows: 2}),
    defineField({
      name: 'span',
      title: 'Desktop column span',
      type: 'number',
      description: 'How wide the card is on large screens. Use 4, 5, 7, or 8.',
      validation: (rule) => rule.min(4).max(12),
    }),
    defineField({name: 'sortOrder', title: 'Sort order', type: 'number'}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'category', media: 'image'},
  },
})
