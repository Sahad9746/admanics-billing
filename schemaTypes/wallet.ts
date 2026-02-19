import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'wallet',
  title: 'Wallet',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Wallet Name',
      type: 'string',
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Cash', value: 'cash' },
          { title: 'Bank', value: 'bank' },
          { title: 'Digital Payment', value: 'digital_payment' },
        ],
      },
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'INR',
      options: {
        list: ['INR', 'USD', 'AED', 'EUR'],
      },
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
