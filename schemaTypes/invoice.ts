import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'invoice',
  title: 'Invoice',
  type: 'document',
  fields: [
    defineField({
      name: 'invoiceNumber',
      title: 'Invoice Number',
      type: 'string',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
    }),
    defineField({
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{ type: 'project' }],
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
    }),
    defineField({
      name: 'dueDate',
      title: 'Due Date',
      type: 'date',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Sent', value: 'sent' },
          { title: 'Paid', value: 'paid' },
          { title: 'Overdue', value: 'overdue' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'description', type: 'string', title: 'Description' },
            { name: 'quantity', type: 'number', title: 'Quantity', initialValue: 1 },
            { name: 'unitPrice', type: 'number', title: 'Unit Price' },
            { name: 'amount', type: 'number', title: 'Amount' },
            { name: 'gstPercentage', type: 'number', title: 'GST Percentage', initialValue: 0 },
            { name: 'gstAmount', type: 'number', title: 'GST Amount', initialValue: 0 },
          ],
        },
      ],
    }),
    defineField({
      name: 'amount',
      title: 'Total Amount',
      type: 'number',
    }),
    defineField({
      name: 'hasSeparateGst',
      title: 'Has Separate GST',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'gstPercentage',
      title: 'Global GST Percentage',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
