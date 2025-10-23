// sanity/schemaTypes/comment.js
export default {
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'comment',
      title: 'Comment Text',
      type: 'text',
      validation: Rule => Rule.required(),
    },
    {
      name: 'postSlug',
      title: 'Post Slug',
      type: 'string',
      description: 'The slug of the post this comment belongs to',
    },
    {
      name: 'parentComment',
      title: 'Parent Comment',
      type: 'reference',
      to: [{ type: 'comment' }],
      description: 'If this is a reply, link to the parent comment',
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
    },
  ],
};
