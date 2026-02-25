import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

export async function GET() {
  const query = `*[_type == "user"]{name, email, role}`
  const users = await client.fetch(query)
  return NextResponse.json({ users })
}
