'use client'
import { useState, useEffect } from "react"
import { getAllUsers, updateUserPermissions } from "@/app/actions"
import toast from "react-hot-toast"
import { Loader2, Save, ArrowLeft, Shield, User, ChevronRight } from "lucide-react"

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  useEffect(() => {
    async function loadUsers() {
      const data = await getAllUsers()
      setUsers(data)
      setLoading(false)
    }
    loadUsers()
  }, [])

  const handlePermissionChange = (module: string, value: string) => {
    if (!selectedUser) return
    
    const updatedUser = {
      ...selectedUser,
      permissions: {
        ...(selectedUser.permissions || {}),
        [module]: value
      }
    }
    
    setSelectedUser(updatedUser)
    
    // Also update in the main users list so it's fresh if they go back
    setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u))
  }

  // ... handle Global Role Change
  const handleRoleChange = (value: string) => {
    if (!selectedUser) return
    const updatedUser = { ...selectedUser, role: value }
    setSelectedUser(updatedUser)
    setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u))
  }

  const savePermissions = async () => {
    if (!selectedUser) return
    setSaving(true)
    const result = await updateUserPermissions(selectedUser._id, selectedUser.role, selectedUser.permissions)
    if (result.success) {
      toast.success(`Access updated for ${selectedUser.name}`)
    } else {
      toast.error(result.error || 'Failed to update user access')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-6 h-6 text-neutral-500" /></div>

  if (selectedUser) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedUser(null)}
            className="p-2 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              Manage Access
            </h3>
            <p className="text-neutral-400 text-sm">Configuring permissions for {selectedUser.name}</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-6 border-b border-neutral-800 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center font-bold text-lg">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">{selectedUser.name}</h4>
                <div className="text-sm text-neutral-400">{selectedUser.email}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-neutral-500 uppercase font-semibold tracking-wider mb-2">Global Role</div>
              <select 
                value={selectedUser.role?.toLowerCase()} 
                onChange={(e) => handleRoleChange(e.target.value)}
                className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer capitalize"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-semibold text-white mb-2">Module Permissions</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'transactions', label: 'Transactions', desc: 'Financial records and entries' },
                { id: 'clients', label: 'Clients', desc: 'Client profiles and CRM' },
                { id: 'projects', label: 'Projects', desc: 'Project budgets and tracking' },
                { id: 'invoices', label: 'Invoices', desc: 'Billing and invoice generation' },
                { id: 'finance', label: 'Finance / Wallets', desc: 'Treasury and account balances' },
                { id: 'worklogs', label: 'Daily Work Logs', desc: 'Employee time and activity tracking' },
              ].map(mod => (
                <div key={mod.id} className="flex items-start justify-between bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/80 hover:border-neutral-700 transition-colors">
                  <div className="pr-4">
                    <div className="font-medium text-white mb-0.5">{mod.label}</div>
                    <div className="text-xs text-neutral-500">{mod.desc}</div>
                  </div>
                  <select 
                    value={selectedUser.permissions?.[mod.id] || 'none'} 
                    onChange={(e) => handlePermissionChange(mod.id, e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer min-w-[110px]"
                  >
                    <option value="none">None</option>
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-8 flex justify-end">
            <button 
              onClick={savePermissions}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Access
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
       <div>
          <h3 className="text-xl font-bold text-white mb-1">Team & Access Management</h3>
          <p className="text-neutral-400 text-sm">Select a user to configure their granular module permissions.</p>
       </div>
       
       <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden mt-6 shadow-xl">
         <div className="overflow-x-auto">
           <table className="w-full text-left text-sm text-neutral-300">
             <thead className="bg-neutral-900/50 border-b border-neutral-800">
               <tr>
                 <th className="px-6 py-4 font-medium text-white whitespace-nowrap">User Name</th>
                 <th className="px-6 py-4 font-medium text-white">Email Address</th>
                 <th className="px-6 py-4 font-medium text-white">Global Role</th>
                 <th className="px-6 py-4 font-medium text-white text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-neutral-800">
               {users.map(u => (
                 <tr key={u._id} className="hover:bg-neutral-900/30 transition-colors group">
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="font-medium text-white flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-400 font-bold border border-neutral-700/50">
                         {u.name.charAt(0).toUpperCase()}
                       </div>
                       {u.name}
                     </div>
                   </td>
                   <td className="px-6 py-4 text-neutral-400">
                     {u.email}
                   </td>
                   <td className="px-6 py-4">
                     <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-neutral-800 text-neutral-400 capitalize border border-neutral-700/50">
                       {u.role}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-right">
                     <button 
                       onClick={() => setSelectedUser(u)}
                       className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white transition-colors py-1.5 px-3 rounded-lg text-xs font-medium border border-neutral-700 group-hover:border-neutral-500 group-hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                     >
                       Manage Access <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:text-white" />
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
    </div>
  )
}
