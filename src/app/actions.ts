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
    let walletId = formData.get('walletId') as string
    let projectId = formData.get('projectId') as string
    let invoiceId = formData.get('invoiceId') as string

    // Dynamic Creation
    if (walletId && walletId.startsWith('new:')) {
      const newWallet = await client.create({ _type: 'wallet', name: walletId.replace('new:', ''), type: 'custom', currency: 'INR', createdAt: new Date().toISOString() })
      walletId = newWallet._id
    }
    if (projectId && projectId.startsWith('new:')) {
      const newProject = await client.create({ _type: 'project', name: projectId.replace('new:', ''), status: 'active', createdAt: new Date().toISOString() })
      projectId = newProject._id
    }
    if (invoiceId && invoiceId.startsWith('new:')) {
      const newInvoice = await client.create({ _type: 'invoice', invoiceNumber: invoiceId.replace('new:', ''), status: 'draft', amount: amount, createdAt: new Date().toISOString() })
      invoiceId = newInvoice._id
    }

    await client.create({
      _type: 'transaction',
      title,
      description,
      amount,
      type,
      category,
      date,
      customFields,
      wallet: walletId ? { _type: 'reference', _ref: walletId } : undefined,
      project: projectId ? { _type: 'reference', _ref: projectId } : undefined,
      invoice: invoiceId ? { _type: 'reference', _ref: invoiceId } : undefined,
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
    let walletId = formData.get('walletId') as string
    let projectId = formData.get('projectId') as string
    let invoiceId = formData.get('invoiceId') as string

    // Dynamic Creation
    if (walletId && walletId.startsWith('new:')) {
      const newWallet = await client.create({ _type: 'wallet', name: walletId.replace('new:', ''), type: 'custom', currency: 'INR', createdAt: new Date().toISOString() })
      walletId = newWallet._id
    }
    if (projectId && projectId.startsWith('new:')) {
      const newProject = await client.create({ _type: 'project', name: projectId.replace('new:', ''), status: 'active', createdAt: new Date().toISOString() })
      projectId = newProject._id
    }
    if (invoiceId && invoiceId.startsWith('new:')) {
      const newInvoice = await client.create({ _type: 'invoice', invoiceNumber: invoiceId.replace('new:', ''), status: 'draft', amount: amount, createdAt: new Date().toISOString() })
      invoiceId = newInvoice._id
    }

    await client.patch(id).set({
      title,
      description,
      amount,
      type,
      category,
      date,
      customFields,
      wallet: walletId ? { _type: 'reference', _ref: walletId } : undefined,
      project: projectId ? { _type: 'reference', _ref: projectId } : undefined,
      invoice: invoiceId ? { _type: 'reference', _ref: invoiceId } : undefined,
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

// --- Wallet Actions ---
export async function getWallets() {
  try {
    const query = `*[_type == "wallet"] | order(createdAt asc) {
      _id,
      name,
      type,
      currency,
      "balance": math::sum(*[_type == "transaction" && wallet._ref == ^._id && type == "income"].amount) - math::sum(*[_type == "transaction" && wallet._ref == ^._id && type == "expense"].amount) + math::sum(*[_type == "transfer" && toWallet._ref == ^._id].amount) - math::sum(*[_type == "transfer" && fromWallet._ref == ^._id].amount)
    }`
    const wallets = await client.fetch(query)
    // Handle cases where math::sum returns null (no transactions match)
    return wallets.map((w: any) => ({
      ...w,
      balance: w.balance || 0
    }))
  } catch (error) {
    console.error("Failed to fetch wallets:", error)
    return []
  }
}

export async function addWallet(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['create'])) return { success: false, error: 'Unauthorized' }

    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const currency = formData.get('currency') as string

    await client.create({
      _type: 'wallet',
      name,
      type,
      currency,
      createdAt: new Date().toISOString(),
    })
    
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error("Failed to create wallet:", error)
    return { success: false, error: 'Failed to create wallet' }
  }
}

export async function editWallet(id: string, formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['edit'])) return { success: false, error: 'Unauthorized' }

    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const currency = formData.get('currency') as string

    await client.patch(id).set({
      name,
      type,
      currency,
    }).commit()
    
    revalidatePath('/')
    revalidatePath('/finance')
    return { success: true }
  } catch (error) {
    console.error("Failed to edit wallet:", error)
    return { success: false, error: 'Failed to edit wallet' }
  }
}

export async function deleteWallet(id: string) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['delete'])) return { success: false, error: 'Unauthorized' }

    // Optional: check if wallet has transactions before deleting
    await client.delete(id)
    
    revalidatePath('/')
    revalidatePath('/finance')
    return { success: true }
  } catch (error) {
    console.error("Failed to delete wallet:", error)
    return { success: false, error: 'Failed to delete wallet' }
  }
}

// --- Client Actions ---
export async function getClients() {
  try {
    const clients = await client.fetch(`*[_type == "client"] | order(name asc)`)
    return clients
  } catch (error) {
    console.error("Failed to fetch clients:", error)
    return []
  }
}

export async function addClient(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['create'])) return { success: false, error: 'Unauthorized' }

    const name = formData.get('name') as string
    const contactPerson = formData.get('contactPerson') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    await client.create({
      _type: 'client',
      name,
      contactPerson,
      email,
      phone,
      status: 'active',
      createdAt: new Date().toISOString(),
    })
    
    revalidatePath('/clients')
    return { success: true }
  } catch (error) {
    console.error("Failed to create client:", error)
    return { success: false, error: 'Failed to create client' }
  }
}

export async function editClient(id: string, formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['edit'])) return { success: false, error: 'Unauthorized' }

    const name = formData.get('name') as string
    const contactPerson = formData.get('contactPerson') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const status = formData.get('status') as string || 'active'

    await client.patch(id).set({
      name,
      contactPerson,
      email,
      phone,
      status,
    }).commit()
    
    revalidatePath('/clients')
    return { success: true }
  } catch (error) {
    console.error("Failed to edit client:", error)
    return { success: false, error: 'Failed to edit client' }
  }
}

export async function deleteClient(id: string) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['delete'])) return { success: false, error: 'Unauthorized' }

    await client.delete(id)
    
    revalidatePath('/clients')
    return { success: true }
  } catch (error) {
    console.error("Failed to delete client:", error)
    return { success: false, error: 'Failed to delete client' }
  }
}

// --- Project Actions ---
export async function getProjects() {
  try {
    const projects = await client.fetch(`*[_type == "project"] | order(createdAt desc) {
      ...,
      client->{_id, name}
    }`)
    return projects
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return []
  }
}

export async function addProject(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['create'])) return { success: false, error: 'Unauthorized' }

    const name = formData.get('name') as string
    const clientId = formData.get('clientId') as string
    const budget = parseFloat(formData.get('budget') as string) || 0

    await client.create({
      _type: 'project',
      name,
      client: {
        _type: 'reference',
        _ref: clientId
      },
      budget,
      status: 'active',
      createdAt: new Date().toISOString(),
    })
    
    revalidatePath('/projects')
    return { success: true }
  } catch (error) {
    console.error("Failed to create project:", error)
    return { success: false, error: 'Failed to create project' }
  }
}

export async function editProject(id: string, formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['edit'])) return { success: false, error: 'Unauthorized' }

    const name = formData.get('name') as string
    const clientId = formData.get('clientId') as string
    const budget = parseFloat(formData.get('budget') as string) || 0
    const status = formData.get('status') as string || 'active'

    await client.patch(id).set({
      name,
      client: {
        _type: 'reference',
        _ref: clientId
      },
      budget,
      status,
    }).commit()
    
    revalidatePath('/projects')
    return { success: true }
  } catch (error) {
    console.error("Failed to edit project:", error)
    return { success: false, error: 'Failed to edit project' }
  }
}

export async function deleteProject(id: string) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['delete'])) return { success: false, error: 'Unauthorized' }

    await client.delete(id)
    
    revalidatePath('/projects')
    return { success: true }
  } catch (error) {
    console.error("Failed to delete project:", error)
    return { success: false, error: 'Failed to delete project' }
  }
}

// --- Invoice Actions ---
export async function getInvoices() {
  try {
    const invoices = await client.fetch(`*[_type == "invoice"] | order(createdAt desc) {
      ...,
      client->{_id, name},
      project->{_id, name}
    }`)
    return invoices
  } catch (error) {
    console.error("Failed to fetch invoices:", error)
    return []
  }
}

export async function addInvoice(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['create'])) return { success: false, error: 'Unauthorized' }

    const invoiceNumber = formData.get('invoiceNumber') as string
    const clientId = formData.get('clientId') as string
    const projectId = formData.get('projectId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const date = formData.get('date') as string
    const dueDate = formData.get('dueDate') as string
    const notes = formData.get('notes') as string
    const itemsString = formData.get('items') as string
    const items = itemsString ? JSON.parse(itemsString) : []

    await client.create({
      _type: 'invoice',
      invoiceNumber,
      client: { _type: 'reference', _ref: clientId },
      project: projectId ? { _type: 'reference', _ref: projectId } : undefined,
      amount,
      date,
      dueDate,
      status: 'draft',
      notes,
      items,
      createdAt: new Date().toISOString(),
    })
    
    revalidatePath('/invoices')
    return { success: true }
  } catch (error) {
    console.error("Failed to create invoice:", error)
    return { success: false, error: 'Failed to create invoice' }
  }
}

export async function editInvoice(id: string, formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['edit'])) return { success: false, error: 'Unauthorized' }

    const invoiceNumber = formData.get('invoiceNumber') as string
    const clientId = formData.get('clientId') as string
    const projectId = formData.get('projectId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const date = formData.get('date') as string
    const dueDate = formData.get('dueDate') as string
    const notes = formData.get('notes') as string
    const status = formData.get('status') as string || 'draft'
    const itemsString = formData.get('items') as string
    const items = itemsString ? JSON.parse(itemsString) : []

    await client.patch(id).set({
      invoiceNumber,
      client: { _type: 'reference', _ref: clientId },
      project: projectId ? { _type: 'reference', _ref: projectId } : undefined,
      amount,
      date,
      dueDate,
      status,
      notes,
      items,
    }).commit()
    
    revalidatePath('/invoices')
    return { success: true }
  } catch (error) {
    console.error("Failed to edit invoice:", error)
    return { success: false, error: 'Failed to edit invoice' }
  }
}

export async function deleteInvoice(id: string) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['delete'])) return { success: false, error: 'Unauthorized' }

    await client.delete(id)
    
    revalidatePath('/invoices')
    return { success: true }
  } catch (error) {
    console.error("Failed to delete invoice:", error)
    return { success: false, error: 'Failed to delete invoice' }
  }
}

// --- Transfer Actions ---
export async function performTransfer(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!checkPermission(user.role, ['create'])) return { success: false, error: 'Unauthorized' }

    const fromWalletId = formData.get('fromWalletId') as string
    const toWalletId = formData.get('toWalletId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const date = formData.get('date') as string
    const notes = formData.get('notes') as string

    if (fromWalletId === toWalletId) {
      return { success: false, error: 'Cannot transfer to the same wallet' }
    }

    // Creating the transfer record
    await client.create({
      _type: 'transfer',
      fromWallet: { _type: 'reference', _ref: fromWalletId },
      toWallet: { _type: 'reference', _ref: toWalletId },
      amount,
      date,
      notes,
      createdBy: { _type: 'reference', _ref: user.id },
      createdAt: new Date().toISOString(),
    })
    
    revalidatePath('/')
    revalidatePath('/finance/wallets')
    return { success: true }
  } catch (error) {
    console.error("Failed to perform transfer:", error)
    return { success: false, error: 'Failed to perform transfer' }
  }
}
