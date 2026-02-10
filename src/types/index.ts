export interface Transaction {
  _id: string
  _createdAt: string
  title: string
  description?: string
  customFields?: { label: string; value: string }[]
  amount: number
  type: 'income' | 'expense'
  category: 'Client' | 'Payroll' | 'Software' | 'Ads'
  date: string
  status: 'active' | 'deleted'
  isEdited: boolean
  lastEditedAt?: string
}
