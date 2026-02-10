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
  const description = formData.get('description') as string
  const customFieldsString = formData.get('customFields') as string
  const customFields = customFieldsString ? JSON.parse(customFieldsString) : []

  try {
    await client.create({
      _type: 'transaction',
      title,
      description,
      amount,
      type,
      category,
      date,
      customFields,
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

export async function deleteTransaction(id: string) {
  try {
    await client.patch(id).set({ status: 'deleted' }).commit()
    revalidatePath('/')
    revalidatePath('/transactions')
    revalidatePath(`/transaction/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to delete transaction:", error)
    return { success: false, error: 'Failed to delete transaction' }
  }
}

export async function editTransaction(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const amount = parseFloat(formData.get('amount') as string)
  const type = formData.get('type') as string
  const category = formData.get('category') as string
  const date = formData.get('date') as string
  const description = formData.get('description') as string
  const customFieldsString = formData.get('customFields') as string
  const customFields = customFieldsString ? JSON.parse(customFieldsString) : []

  try {
    await client.patch(id).set({
      title,
      description,
      amount,
      type,
      category,
      date,
      customFields,
      isEdited: true,
      lastEditedAt: new Date().toISOString(),
    }).commit()
    revalidatePath('/')
    revalidatePath('/transactions')
    revalidatePath(`/transaction/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to edit transaction:", error)
    return { success: false, error: 'Failed to edit transaction' }
  }
}

export async function deleteTransactions(ids: string[]) {
  try {
    const transaction = client.transaction()
    ids.forEach((id) => {
      transaction.patch(id, (p) => p.set({ status: 'deleted' }))
    })
    await transaction.commit()
    
    revalidatePath('/')
    revalidatePath('/transactions')
    ids.forEach((id) => revalidatePath(`/transaction/${id}`))
    
    return { success: true }
  } catch (error) {
    console.error("Failed to delete transactions:", error)
    return { success: false, error: 'Failed to delete transactions' }
  }
}
