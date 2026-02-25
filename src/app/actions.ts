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
    let clientId = formData.get('clientId') as string

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
    if (clientId && clientId.startsWith('new:')) {
      const newClient = await client.create({ _type: 'client', name: clientId.replace('new:', ''), createdAt: new Date().toISOString() })
      clientId = newClient._id
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
      client: clientId ? { _type: 'reference', _ref: clientId } : undefined,
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
    let clientId = formData.get('clientId') as string

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
    if (clientId && clientId.startsWith('new:')) {
      const newClient = await client.create({ _type: 'client', name: clientId.replace('new:', ''), createdAt: new Date().toISOString() })
      clientId = newClient._id
    }

    const patch = client.patch(id).set({
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
    })

    if (walletId) patch.set({ wallet: { _type: 'reference', _ref: walletId } })
    else patch.unset(['wallet'])

    if (clientId) patch.set({ client: { _type: 'reference', _ref: clientId } })
    else patch.unset(['client'])

    if (projectId) patch.set({ project: { _type: 'reference', _ref: projectId } })
    else patch.unset(['project'])

    if (invoiceId) patch.set({ invoice: { _type: 'reference', _ref: invoiceId } })
    else patch.unset(['invoice'])

    await patch.commit()
    
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
      "balance": math::sum(*[_type == "transaction" && wallet._ref == ^._id && type in ["income", "credit"]].amount) - math::sum(*[_type == "transaction" && wallet._ref == ^._id && type == "expense"].amount) + math::sum(*[_type == "transfer" && toWallet._ref == ^._id].amount) - math::sum(*[_type == "transfer" && fromWallet._ref == ^._id].amount)
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

// --- Work Log Actions ---
export async function getWorkLogs() {
  try {
    const user = await getCurrentUser()
    let query = ''
    
    if (checkPermission(user.role, ['edit', 'delete'])) {
      // Admin/Editor sees all
      query = `*[_type == "dailyWorkLog"] | order(date desc) {
        ...,
        client->{_id, name},
        user->{_id, name, email}
      }`
    } else {
      // Regular user sees only their own
      query = `*[_type == "dailyWorkLog" && user._ref == "${user.id}"] | order(date desc) {
        ...,
        client->{_id, name},
        user->{_id, name, email}
      }`
    }
    
    const logs = await client.fetch(query)
    return logs
  } catch (error) {
    console.error("Failed to fetch work logs:", error)
    return []
  }
}

export async function getClientsWithProjects() {
   try {
     // Fetch active clients and their associated projects
     const clients = await client.fetch(`*[_type == "client" && status == "active"] | order(name asc) {
       _id,
       name,
       "projects": *[_type == "project" && references(^._id) && status == "active"] {
         _id,
         name
       }
     }`)
     return clients
   } catch (error) {
     console.error("Failed to fetch clients with projects:", error)
     return []
   }
}

export async function addWorkLog(formData: FormData) {
  try {
    const user = await getCurrentUser()
    // Anyone can create their own work log
    const employeeName = formData.get('employeeName') as string || user.name
    const clientId = formData.get('clientId') as string
    const project = formData.get('project') as string
    const taskSummary = formData.get('taskSummary') as string
    const hoursWorkedStr = formData.get('hoursWorked') as string
    const hoursWorked = hoursWorkedStr ? parseFloat(hoursWorkedStr) : undefined
    const status = formData.get('status') as string
    const notes = formData.get('notes') as string
    const date = formData.get('date') as string

    if (!clientId) return { success: false, error: 'Client is required' }

    await client.create({
      _type: 'dailyWorkLog',
      employeeName,
      client: { _type: 'reference', _ref: clientId },
      project,
      taskSummary,
      hoursWorked,
      status,
      notes,
      date,
      synced: false,
      user: { _type: 'reference', _ref: user.id }
    })
    
    revalidatePath('/dashboard/daily-update')
    return { success: true }
  } catch (error) {
    console.error("Failed to create work log:", error)
    return { success: false, error: 'Failed to create work log' }
  }
}

export async function editWorkLog(id: string, formData: FormData) {
  try {
    const user = await getCurrentUser()
    const log = await client.fetch(`*[_type == "dailyWorkLog" && _id == $id][0]`, { id })
    
    if (!log) return { success: false, error: 'Work log not found' }
    
    // Admins can edit any, users can edit their own
    if (!checkPermission(user.role, ['edit']) && log.user?._ref !== user.id) {
      return { success: false, error: 'Unauthorized to edit this work log' }
    }

    const employeeName = formData.get('employeeName') as string || user.name
    const clientId = formData.get('clientId') as string
    const project = formData.get('project') as string
    const taskSummary = formData.get('taskSummary') as string
    const hoursWorkedStr = formData.get('hoursWorked') as string
    const hoursWorked = hoursWorkedStr ? parseFloat(hoursWorkedStr) : undefined
    const status = formData.get('status') as string
    const notes = formData.get('notes') as string
    const date = formData.get('date') as string

    if (!clientId) return { success: false, error: 'Client is required' }

    await client.patch(id).set({
      employeeName,
      client: { _type: 'reference', _ref: clientId },
      project,
      taskSummary,
      hoursWorked,
      status,
      notes,
      date,
      synced: false, // Reset synced status so it pushes the update to Google Sheets
    }).commit()
    
    revalidatePath('/dashboard/daily-update')
    return { success: true }
  } catch (error) {
    console.error("Failed to edit work log:", error)
    return { success: false, error: 'Failed to edit work log' }
  }
}

export async function deleteWorkLog(id: string) {
  try {
    const user = await getCurrentUser()
    const log = await client.fetch(`*[_type == "dailyWorkLog" && _id == $id][0]`, { id })
    
    if (!log) return { success: false, error: 'Work log not found' }
    
    // Admins can delete any, users can delete their own
    if (!checkPermission(user.role, ['delete']) && log.user?._ref !== user.id) {
      return { success: false, error: 'Unauthorized to delete this work log' }
    }

    await client.delete(id)
    
    revalidatePath('/dashboard/daily-update')
    return { success: true }
  } catch (error) {
    console.error("Failed to delete work log:", error)
    return { success: false, error: 'Failed to delete work log' }
  }
}

// --- Client Dashboard Action ---
export async function getClientDashboardData(clientId: string) {
  try {
    const user = await getCurrentUser()
    const isAdminOrEditor = checkPermission(user.role, ['edit'])

    // Fetch client details
    const clientData = await client.fetch(`*[_type == "client" && _id == $clientId][0]`, { clientId })
    if (!clientData) return null

    // Fetch all invoices for this client
    const invoices = await client.fetch(
      `*[_type == "invoice" && client._ref == $clientId] | order(date desc) {
        ...,
        project->{_id, name}
      }`, 
      { clientId }
    )

    // Calculate total fees from invoices
    const totalFees = invoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0)

    // Fetch income transactions linked specifically to this client (through project or invoice)
    // First figure out project and invoice ids
    const projectIds = await client.fetch(`*[_type == "project" && client._ref == $clientId]._id`, { clientId })
    const invoiceIds = invoices.map((inv: any) => inv._id)

    let incomeQuery = `*[_type == "transaction" && type in ["income", "credit"] && (`
    let conditions = []
    
    // Also include transactions directly linked to this client, not just through projects/invoices
    conditions.push(`client._ref == $clientId`)

    if (projectIds.length > 0) {
      conditions.push(`project._ref in $projectIds`)
    }
    if (invoiceIds.length > 0) {
      conditions.push(`invoice._ref in $invoiceIds`)
    }
    
    let totalIncome = 0
    if (conditions.length > 0) {
      incomeQuery += conditions.join(' || ') + `)]`
      const params: any = { clientId }
      if (projectIds.length > 0) params.projectIds = projectIds
      if (invoiceIds.length > 0) params.invoiceIds = invoiceIds
      
      const incomeTransactions = await client.fetch(incomeQuery, params)
      totalIncome = incomeTransactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
    }

    // Fetch expenses tied directly to this client (since we added `client` reference to transactions)
    const expenses = await client.fetch(
      `*[_type == "transaction" && type == "expense" && client._ref == $clientId]`,
      { clientId }
    )
    
    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
    const totalAdSpend = expenses
        .filter((exp: any) => exp.category === 'Ad Spend')
        .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)

    // Fetch work logs tied explicitly to this client
    
    const userCondition = isAdminOrEditor ? "" : `&& user._ref == "${user.id}"`
    const workLogs = await client.fetch(
      `*[_type == "dailyWorkLog" ${userCondition} && client._ref == $clientId] | order(date desc) {
        ...,
        user->{_id, name, email}
      }`,
      { clientId }
    )

    return {
      client: clientData,
      invoices,
      totalFees,
      totalIncome,
      workLogs,
      totalExpenses,
      totalAdSpend
    }
  } catch (error) {
    console.error("Failed to fetch client dashboard data:", error)
    return null
  }
}
