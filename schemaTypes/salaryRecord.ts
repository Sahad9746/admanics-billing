import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'salaryRecord',
  title: 'Salary Record',
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
      name: 'monthYear',
      title: 'Month & Year',
      type: 'string',
      description: 'e.g., April 2026',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'baseSalary',
      title: 'Base Salary',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'bonus',
      title: 'Bonus / Allowances',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'advanceDeductions',
      title: 'Advance Deductions',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'advancePayment' }] }],
    }),
    defineField({
      name: 'totalDeductions',
      title: 'Total Deductions',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'netSalary',
      title: 'Net Salary',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Paid', value: 'paid' },
        ],
      },
      initialValue: 'draft',
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
  preview: {
    select: {
      title: 'employee.user.name',
      month: 'monthYear',
      net: 'netSalary',
    },
    prepare({ title, month, net }) {
      return {
        title: title ? `${title} - ${month}` : month,
        subtitle: `Net: ${net}`,
      }
    },
  },
})
