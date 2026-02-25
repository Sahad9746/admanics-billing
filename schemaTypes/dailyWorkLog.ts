import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'dailyWorkLog',
  title: 'Daily Work Log',
  type: 'document',
  fields: [
    defineField({
      name: 'employeeName',
      title: 'Employee Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'project',
      title: 'Project',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'taskSummary',
      title: 'Task Summary',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hoursWorked',
      title: 'Hours Worked',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(24),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Completed', value: 'Completed' },
          { title: 'In Progress', value: 'In Progress' },
          { title: 'Blocked', value: 'Blocked' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'synced',
      title: 'Synced to Google Sheets',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'employeeName',
      subtitle: 'date',
    },
  },
})
