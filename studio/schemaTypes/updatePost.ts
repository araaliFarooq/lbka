import {defineField, defineType} from 'sanity'

export const updatePost = defineType({
  name: 'updatePost',
  title: 'Update',
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
          {title: 'Pilgrimage', value: 'pilgrimage'},
          {title: 'Safari', value: 'safari'},
          {title: 'Halal', value: 'halal'},
          {title: 'Announcements', value: 'announcements'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3}),
    defineField({name: 'body', title: 'Body', type: 'array', of: [{type: 'block'}]}),
    defineField({name: 'featured', title: 'Featured lead story', type: 'boolean', initialValue: false}),
    defineField({name: 'image', title: 'Image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'imageUrl', title: 'Image URL', type: 'url'}),
    defineField({name: 'imageAlt', title: 'Image description', type: 'text', rows: 2}),
    defineField({name: 'readTime', title: 'Read time', type: 'string'}),
    defineField({name: 'place', title: 'Place label', type: 'string'}),
    defineField({name: 'sortOrder', title: 'Sort order', type: 'number'}),
  ],
  preview: {
    select: {title: 'title', category: 'category', featured: 'featured', media: 'image'},
    prepare: ({title, category, featured, media}) => ({
      title,
      subtitle: [featured ? 'Featured' : '', category].filter(Boolean).join(' · '),
      media,
    }),
  },
})
