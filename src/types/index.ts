export interface Transaction {
  _id: string
  _createdAt: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: 'Client' | 'Payroll' | 'Software' | 'Ads'
  date: string
}
