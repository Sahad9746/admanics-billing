import { client } from './sanity'

export interface DailyWorkLog {
  _id: string
  employeeName: string
  project: string
  taskSummary: string
  hoursWorked?: number
  status: string
  notes?: string
  date: string
  synced: boolean
  client?: {
    _id: string
    name: string
    googleSheetId?: string
  }
}

export async function getUnsyncedLogs(): Promise<DailyWorkLog[]> {
  const query = `*[_type == "dailyWorkLog" && synced == false] | order(date asc) {
    ...,
    client->{_id, name, googleSheetId}
  }`
  return await client.fetch(query)
}

export async function markLogsSynced(ids: string[]) {
  if (!ids || ids.length === 0) return

  const transaction = client.transaction()
  
  ids.forEach(id => {
    transaction.patch(id, p => p.set({ synced: true }))
  })

  await transaction.commit()
}
