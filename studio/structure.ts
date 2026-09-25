import type {StructureResolver} from 'sanity/structure'

const SINGLETONS = ['siteSettings']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('LABAIKA')
    .items([
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('tourPackage').title('Packages'),
      S.documentTypeListItem('galleryItem').title('Gallery'),
      S.documentTypeListItem('updatePost').title('Updates'),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return id ? !SINGLETONS.includes(id) && !['page', 'tourPackage', 'galleryItem', 'updatePost'].includes(id) : false
      }),
    ])
