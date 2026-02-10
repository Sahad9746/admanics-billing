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
      options: {
        list: [
          { title: 'Income', value: 'income' },
          { title: 'Expense', value: 'expense' },
        ],
      },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Client', value: 'Client' },
          { title: 'Payroll', value: 'Payroll' },
          { title: 'Software', value: 'Software' },
          { title: 'Ads', value: 'Ads' },
        ],
      },
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
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
  ],
})
