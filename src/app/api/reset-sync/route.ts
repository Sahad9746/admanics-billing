import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

export async function GET() {
  const query = `*[_type == "dailyWorkLog" && synced == true]`
  const logs = await client.fetch(query)

  if (logs.length > 0) {
    const transaction = client.transaction()
    logs.forEach((log: any) => {
      transaction.patch(log._id, p => p.set({ synced: false }))
    })
    await transaction.commit()
  }

  return NextResponse.json({ success: true, count: logs.length, message: "Reset synced status to false for all logs to test again." })
}
