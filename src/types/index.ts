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
  type: 'income' | 'expense' | 'transfer'
  category: string
  date: string
  status?: 'active' | 'deleted'
  isEdited?: boolean
  lastEditedAt?: string
  customFields?: { label: string; value: string }[]
  wallet?: { _ref: string }
  project?: { _ref: string }
  invoice?: { _ref: string }
  createdBy?: User
  createdAt?: string
  lastEditedBy?: User
  deletedBy?: User
  deletedAt?: string
}
