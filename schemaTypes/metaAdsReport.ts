import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'metaAdsReport',
  title: 'Meta Ads Report',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      initialValue: 'Adsomia India Pvt Ltd',
    }),
    defineField({
      name: 'periodStart',
      title: 'Reporting Period Start',
      type: 'date',
    }),
    defineField({
      name: 'periodEnd',
      title: 'Reporting Period End',
      type: 'date',
    }),
    defineField({
      name: 'adAccountName',
      title: 'Ad Account Name',
      type: 'string',
    }),
    defineField({
      name: 'adAccountId',
      title: 'Ad Account ID',
      type: 'string',
    }),
    defineField({
      name: 'totalCampaigns',
      title: 'Total Campaigns',
      type: 'number',
    }),
    defineField({
      name: 'totalLeadsGenerated',
      title: 'Total Leads Generated',
      type: 'number',
    }),
    defineField({
      name: 'totalCampaignSpend',
      title: 'Total Campaign Spend',
      type: 'number',
    }),
    defineField({
      name: 'averageCpl',
      title: 'Average Cost Per Lead (CPL)',
      type: 'number',
    }),
    defineField({
      name: 'fundingReceipts',
      title: 'Funding Receipts',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'receiptDate', type: 'date', title: 'Receipt Date' },
            { name: 'paymentMethod', type: 'string', title: 'Payment Method' },
            { name: 'amountFunded', type: 'number', title: 'Amount Funded (₹)' },
            { name: 'note', type: 'string', title: 'Note (e.g. Service charge)' },
          ],
        },
      ],
    }),
    defineField({
      name: 'preparedByName',
      title: 'Prepared By Name',
      type: 'string',
    }),
    defineField({
      name: 'preparedByTitle',
      title: 'Prepared By Title',
      type: 'string',
      initialValue: 'Digital Marketing Analyst'
    }),
    defineField({
      name: 'receiptsNote',
      title: 'Receipts Note',
      type: 'string',
      initialValue: 'Payment receipts are attached below'
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
