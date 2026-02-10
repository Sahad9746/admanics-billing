'use client'

import { logout } from "@/app/actions"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="p-2 text-neutral-400 hover:text-white transition-colors"
      title="Logout"
    >
      <LogOut className="w-5 h-5" />
    </button>
  )
}
