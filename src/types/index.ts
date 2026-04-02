export type UserRole = 'admin' | 'editor' | 'viewer'

export interface User {
  _id: string
  name: string
  email: string
  password: string
  role: UserRole
  createdAt: string
}

export interface Transaction {
  _id: string
  title: string
  description?: string
  amount: number
  type: 'income' | 'expense' | 'transfer' | 'credit'
  category: string
  date: string
  status?: 'active' | 'deleted'
  isEdited?: boolean
  lastEditedAt?: string
  customFields?: { label: string; value: string }[]
  wallet?: { _ref?: string; _id?: string; name?: string }
  client?: { _ref?: string; _id?: string; name?: string }
  project?: { _ref?: string; _id?: string; name?: string }
  invoice?: { _ref?: string; _id?: string; invoiceNumber?: string }
  createdBy?: User
  createdAt?: string
  lastEditedBy?: User
  deletedBy?: User
  deletedAt?: string
}

export interface MetaAdsReport {
  _id: string
  companyName: string
  periodStart: string
  periodEnd: string
  adAccountName: string
  adAccountId: string
  totalCampaigns: number
  totalLeadsGenerated: number
  totalCampaignSpend: number
  averageCpl: number
  fundingReceipts: {
    _key: string
    receiptDate: string
    paymentMethod: string
    amountFunded: number
    note?: string
  }[]
  preparedByName: string
  preparedByTitle: string
  receiptsNote: string
  createdAt: string
}
