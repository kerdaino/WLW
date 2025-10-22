export default {
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'text',
      title: 'Comment Text',
      type: 'text',
    },
    {
      name: 'postSlug',
      title: 'Post Slug',
      type: 'string',
      description: 'URL path of the post this comment belongs to',
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    },
  ],
}
