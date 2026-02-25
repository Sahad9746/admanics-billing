import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

export async function GET() {
  const query = `*[_type == "dailyWorkLog"] | order(date desc)[0...5] {
    ...,
    client->{_id, name, googleSheetId}
  }`
  const clients = await client.fetch(query)
  return NextResponse.json({ clients })
}
