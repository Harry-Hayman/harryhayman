import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.text({
          label: 'Title',
          validation: { isRequired: true },
        }),
        description: fields.text({
          label: 'Description',
          description: 'A brief description of the blog post',
          validation: { isRequired: true },
        }),
        pubDate: fields.date({
          label: 'Publication Date',
          description: 'The date this post was published',
          validation: { isRequired: true },
        }),
        updatedDate: fields.date({
          label: 'Updated Date',
          description: 'The date this post was last updated',
        }),
        image: fields.image({
          label: 'Hero Image',
          description: 'The main image for the blog post',
          directory: 'src/assets/blogs',
          publicPath: '../../assets/blogs/',
        }),
        heroAlt: fields.text({
          label: 'Hero Image Alt Text',
          description: 'Alt text for the hero image',
        }),
        category: fields.select({
          label: 'Category',
          description: 'The category this post belongs to',
          options: [
            { label: 'Hospitality', value: 'Hospitality' },
            { label: 'Jazz', value: 'Jazz' },
            { label: 'Community', value: 'Community' },
            { label: 'Sustainability', value: 'Sustainability' },
            { label: 'Arts & Culture', value: 'Arts & Culture' },
            { label: 'Business', value: 'Business' },
          ],
          defaultValue: 'Community',
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            description: 'Tags for this post',
            itemLabel: props => props.value || 'Tag',
          }
        ),
        content: fields.mdx({
          label: 'Content',
          options: {
            image: {
              directory: 'src/assets/blogs',
              publicPath: '../../assets/blogs/',
            },
          },
        }),
      },
    }),
  },
});