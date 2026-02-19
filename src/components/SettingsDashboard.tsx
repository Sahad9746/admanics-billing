'use client'

import { useState } from "react"
import { User, Bell, Shield, Wallet, Paintbrush, Loader2, Save } from "lucide-react"
import toast from "react-hot-toast"
import { CurrencyToggle } from "@/components/CurrencyToggle"

export function SettingsDashboard({ user }: { user: { name: string; email: string; role: string } }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setSaving(false)
    toast.success('Settings saved successfully')
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 space-y-2">
         <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
              activeTab === 'profile' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent'
            }`}
         >
           <User className="w-5 h-5" />
           <span className="font-medium">Profile Details</span>
         </button>
         <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
              activeTab === 'preferences' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent'
            }`}
         >
           <Paintbrush className="w-5 h-5" />
           <span className="font-medium">App Preferences</span>
         </button>
         <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
              activeTab === 'security' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent'
            }`}
         >
           <Shield className="w-5 h-5" />
           <span className="font-medium">Security</span>
         </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8">
         {activeTab === 'profile' && (
             <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                   <h3 className="text-xl font-bold text-white mb-1">Profile Information</h3>
                   <p className="text-neutral-400 text-sm">Update your account details and public identity.</p>
                </div>
                
                <div className="space-y-4 max-w-xl">
                   <div>
                       <label className="block text-sm font-medium text-neutral-300 mb-1.5">Full Name</label>
                       <input 
                          type="text" 
                          defaultValue={user.name}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                       />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email Address</label>
                       <input 
                          type="email" 
                          defaultValue={user.email}
                          disabled
                          className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-500 cursor-not-allowed outline-none"
                       />
                       <p className="text-xs text-neutral-500 mt-1.5">Email addresses cannot be changed for established accounts.</p>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-neutral-300 mb-1.5">Role</label>
                       <div className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-500 capitalize cursor-not-allowed outline-none">
                         {user.role}
                       </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-neutral-800 flex justify-end">
                    <button 
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
             </form>
         )}

         {activeTab === 'preferences' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                   <h3 className="text-xl font-bold text-white mb-1">Application Preferences</h3>
                   <p className="text-neutral-400 text-sm">Customize how the billing application behaves for you.</p>
                </div>
                
                <div className="space-y-6 max-w-xl pt-4">
                   <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-950/30">
                       <div className="space-y-1">
                           <div className="font-medium text-white flex items-center gap-2">
                               <Wallet className="w-4 h-4 text-neutral-400" />
                               Default Currency
                           </div>
                           <p className="text-sm text-neutral-400">Set your preferred display currency across the app.</p>
                       </div>
                       <div>
                           <CurrencyToggle />
                       </div>
                   </div>

                   <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-950/30">
                       <div className="space-y-1">
                           <div className="font-medium text-white flex items-center gap-2">
                               <Bell className="w-4 h-4 text-neutral-400" />
                               Notifications
                           </div>
                           <p className="text-sm text-neutral-400">Enable dashboard alerts. (Coming soon)</p>
                       </div>
                       <div>
                           <div className="w-11 h-6 bg-neutral-800 rounded-full cursor-not-allowed opacity-50 relative">
                               <div className="absolute left-1 top-1 bg-neutral-500 w-4 h-4 rounded-full"></div>
                           </div>
                       </div>
                   </div>
                </div>
             </div>
         )}

         {activeTab === 'security' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                   <h3 className="text-xl font-bold text-white mb-1">Security & Access</h3>
                   <p className="text-neutral-400 text-sm">Manage your password and session security.</p>
                </div>
                
                <div className="space-y-6 max-w-xl pt-4">
                    <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/30 space-y-4">
                        <div>
                         <label className="block text-sm font-medium text-neutral-300 mb-1.5">Current Password</label>
                         <input 
                            type="password" 
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                         />
                        </div>
                        <div>
                         <label className="block text-sm font-medium text-neutral-300 mb-1.5">New Password</label>
                         <input 
                            type="password" 
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                         />
                        </div>
                        <button className="bg-neutral-800 text-white font-medium py-2 px-4 rounded-lg hover:bg-neutral-700 transition-colors w-full mt-2">
                            Update Password
                        </button>
                    </div>

                    <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
                        <h4 className="text-red-400 font-semibold">Danger Zone</h4>
                        <p className="text-sm text-neutral-400 mb-4">Requesting account deletion will flag your user for removal by an admin.</p>
                        <button className="bg-red-500/10 text-red-500 border border-red-500/20 font-semibold py-2 px-4 rounded-lg hover:bg-red-500/20 transition-colors">
                            Request Account Deletion
                        </button>
                    </div>
                </div>
             </div>
         )}
      </div>
    </div>
  )
}
