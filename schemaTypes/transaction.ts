import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'transaction',
  title: 'Transaction',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'customFields',
      title: 'Custom Fields',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', type: 'string', title: 'Label' },
            { name: 'value', type: 'string', title: 'Value' },
          ],
        },
      ],
    }),
    defineField({
      name: 'amount',
      title: 'Amount',
      type: 'number',
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
    }),
    defineField({
      name: 'wallet',
      title: 'Wallet',
      type: 'reference',
      to: [{ type: 'wallet' }],
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      weak: true,
    }),
    defineField({
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{ type: 'project' }],
    }),
    defineField({
      name: 'invoice',
      title: 'Invoice',
      type: 'reference',
      to: [{ type: 'invoice' }],
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Income', value: 'income' },
          { title: 'Expense', value: 'expense' },
          { title: 'Transfer', value: 'transfer' },
          { title: 'Credit', value: 'credit' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Deleted', value: 'deleted' },
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'isEdited',
      title: 'Is Edited',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'lastEditedAt',
      title: 'Last Edited At',
      type: 'datetime',
    }),
    defineField({
      name: 'createdBy',
      title: 'Created By',
      type: 'reference',
      to: [{ type: 'user' }],
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'lastEditedBy',
      title: 'Last Edited By',
      type: 'reference',
      to: [{ type: 'user' }],
    }),
    defineField({
      name: 'deletedBy',
      title: 'Deleted By',
      type: 'reference',
      to: [{ type: 'user' }],
    }),
    defineField({
      name: 'deletedAt',
      title: 'Deleted At',
      type: 'datetime',
    }),
  ],
})
