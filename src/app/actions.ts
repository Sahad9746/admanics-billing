'use server'

import { client } from "@/lib/sanity"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import bcrypt from "bcryptjs"

// Helper function to get current user session
async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user
}

// Helper function to check permissions
function checkPermission(userRole: string, requiredPermissions: string[]) {
  const rolePermissions: Record<string, string[]> = {
    admin: ['view', 'create', 'edit', 'delete'],
    editor: ['view', 'create', 'edit'],
    viewer: ['view'],
  }
  
  const permissions = rolePermissions[userRole] || []
  return requiredPermissions.every(p => permissions.includes(p))
}

// Register new user
export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) || 'viewer'

  try {
    // Check if user already exists
    const existingUser = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    )

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    await client.create({
      _type: 'user',
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to register user:", error)
    return { success: false, error: 'Failed to register user' }
  }
}

export async function addTransaction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    
    if (!checkPermission(user.role, ['create'])) {
      return { success: false, error: 'You do not have permission to create transactions' }
    }

    const title = formData.get('title') as string
    const amount = parseFloat(formData.get('amount') as string)
    const type = formData.get('type') as string
    const category = formData.get('category') as string
    const date = formData.get('date') as string
    const description = formData.get('description') as string
    const customFieldsString = formData.get('customFields') as string
    const customFields = customFieldsString ? JSON.parse(customFieldsString) : []

    await client.create({
      _type: 'transaction',
      title,
      description,
      amount,
      type,
      category,
      date,
      customFields,
      createdBy: {
        _type: 'reference',
        _ref: user.id,
      },
      createdAt: new Date().toISOString(),
    })
    
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error("Failed to create transaction:", error)
    return { success: false, error: 'Failed to create transaction' }
  }
}

export async function deleteTransaction(id: string) {
  try {
    const user = await getCurrentUser()
    
    if (!checkPermission(user.role, ['delete'])) {
      return { success: false, error: 'You do not have permission to delete transactions' }
    }

    await client.delete(id)
    
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
  try {
    const user = await getCurrentUser()
    
    if (!checkPermission(user.role, ['edit'])) {
      return { success: false, error: 'You do not have permission to edit transactions' }
    }

    const title = formData.get('title') as string
    const amount = parseFloat(formData.get('amount') as string)
    const type = formData.get('type') as string
    const category = formData.get('category') as string
    const date = formData.get('date') as string
    const description = formData.get('description') as string
    const customFieldsString = formData.get('customFields') as string
    const customFields = customFieldsString ? JSON.parse(customFieldsString) : []

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
      lastEditedBy: {
        _type: 'reference',
        _ref: user.id,
      },
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
    const user = await getCurrentUser()
    
    if (!checkPermission(user.role, ['delete'])) {
      return { success: false, error: 'You do not have permission to delete transactions' }
    }

    const transaction = client.transaction()
    ids.forEach((id) => {
      transaction.delete(id)
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
