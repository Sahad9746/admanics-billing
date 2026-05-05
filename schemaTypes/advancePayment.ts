import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'advancePayment',
  title: 'Advance Payment',
  type: 'document',
  fields: [
    defineField({
      name: 'employee',
      title: 'Employee',
      type: 'reference',
      to: [{ type: 'employeeProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'amount',
      title: 'Amount',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'date',
      title: 'Date Taken',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reason',
      title: 'Reason',
      type: 'text',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending Deduction', value: 'pending' },
          { title: 'Deducted', value: 'deducted' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'deductedInMonth',
      title: 'Deducted In Month',
      type: 'string',
      description: 'The month this advance was deducted from salary (e.g., April 2026)',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'employee.user.name',
      amount: 'amount',
      status: 'status',
    },
    prepare({ title, amount, status }) {
      return {
        title: title ? `${title} - Advance` : 'Advance',
        subtitle: `${amount} (${status})`,
      }
    },
  },
})
