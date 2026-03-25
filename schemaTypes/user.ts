import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'password',
      title: 'Password (Hashed)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Admin', value: 'admin' },
          { title: 'Editor', value: 'editor' },
          { title: 'Viewer', value: 'viewer' },
        ],
      },
      initialValue: 'viewer',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'permissions',
      title: 'Module Permissions',
      type: 'object',
      fields: [
        { name: 'transactions', title: 'Transactions', type: 'string', initialValue: 'none', options: { list: ['admin', 'editor', 'viewer', 'none'] } },
        { name: 'clients', title: 'Clients', type: 'string', initialValue: 'none', options: { list: ['admin', 'editor', 'viewer', 'none'] } },
        { name: 'projects', title: 'Projects', type: 'string', initialValue: 'none', options: { list: ['admin', 'editor', 'viewer', 'none'] } },
        { name: 'invoices', title: 'Invoices', type: 'string', initialValue: 'none', options: { list: ['admin', 'editor', 'viewer', 'none'] } },
        { name: 'finance', title: 'Finance / Wallets', type: 'string', initialValue: 'none', options: { list: ['admin', 'editor', 'viewer', 'none'] } },
        { name: 'worklogs', title: 'Daily Work Logs', type: 'string', initialValue: 'none', options: { list: ['admin', 'editor', 'viewer', 'none'] } },
      ],
    }),
  ],
})
