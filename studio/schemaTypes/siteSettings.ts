import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({name: 'siteName', title: 'Site name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'tagline', title: 'Tagline', type: 'string'}),
    defineField({name: 'phone', title: 'Primary phone', type: 'string'}),
    defineField({name: 'secondaryPhone', title: 'Secondary phone', type: 'string'}),
    defineField({name: 'email', title: 'Email', type: 'string'}),
    defineField({name: 'whatsapp', title: 'WhatsApp number', type: 'string', description: 'Digits only, with country code. Example: 256772676128'}),
    defineField({name: 'kampalaAddress', title: 'Kampala office', type: 'text', rows: 2}),
    defineField({name: 'jinjaAddress', title: 'Jinja office', type: 'text', rows: 2}),
    defineField({name: 'facebook', title: 'Facebook URL', type: 'url'}),
    defineField({name: 'youtube', title: 'YouTube URL', type: 'url'}),
    defineField({name: 'tiktok', title: 'TikTok URL', type: 'url'}),
  ],
  preview: {
    prepare: () => ({title: 'Site settings'}),
  },
})
