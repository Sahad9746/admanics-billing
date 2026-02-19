import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'transfer',
  title: 'Transfer',
  type: 'document',
  fields: [
    defineField({
      name: 'fromWallet',
      title: 'From Wallet',
      type: 'reference',
      to: [{ type: 'wallet' }],
    }),
    defineField({
      name: 'toWallet',
      title: 'To Wallet',
      type: 'reference',
      to: [{ type: 'wallet' }],
    }),
    defineField({
      name: 'amount',
      title: 'Amount',
      type: 'number',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
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
  ],
})
