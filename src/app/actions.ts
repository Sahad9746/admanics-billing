'use server'

import { client } from "@/lib/sanity"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const password = formData.get('password') as string
  const validPassword = process.env.ADMANICS_PASSWORD

  if (password === validPassword) {
    // Set cookie
    (await cookies()).set('admanics-auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    })
    redirect('/')
  }
}


export async function addTransaction(formData: FormData) {
  const title = formData.get('title') as string
  const amount = parseFloat(formData.get('amount') as string)
  const type = formData.get('type') as string
  const category = formData.get('category') as string
  const date = formData.get('date') as string

  try {
    await client.create({
      _type: 'transaction',
      title,
      amount,
      type,
      category,
      date,
    })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error("Failed to create transaction:", error)
    return { success: false, error: 'Failed to create transaction' }
  }
}

export async function logout() {
  (await cookies()).delete('admanics-auth')
  redirect('/login')
}
