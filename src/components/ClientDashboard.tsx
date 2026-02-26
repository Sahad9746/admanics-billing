'use client'

import { format } from "date-fns"
import { useCurrency } from "@/components/Providers"
import { formatCurrency } from "@/lib/utils"
import { Briefcase, Wallet, Clock, FileText, CheckCircle2, Megaphone } from "lucide-react"
import Link from "next/link"
import React, { useState } from "react"

interface ClientDashboardProps {
  data: {
    client: any
    invoices: any[]
    totalFees: number
    totalIncome: number
    totalExpenses: number
    totalAdSpend: number
    workLogs: any[]
    allTransactions?: any[]
  }
}

export function ClientDashboard({ data }: ClientDashboardProps) {
  const { currency, exchangeRate } = useCurrency()
  const { client, invoices, totalFees, totalIncome, totalExpenses, totalAdSpend, workLogs, allTransactions } = data

  const [txPage, setTxPage] = useState(1)
  const TX_PER_PAGE = 10
  const totalTxPages = Math.ceil((allTransactions?.length || 0) / TX_PER_PAGE)
  const paginatedTx = (allTransactions || []).slice((txPage - 1) * TX_PER_PAGE, txPage * TX_PER_PAGE)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-400'
      case 'sent': return 'bg-blue-500/10 text-blue-400'
      case 'overdue': return 'bg-red-500/10 text-red-400'
      case 'Completed': return 'bg-green-500/10 text-green-400'
      case 'In Progress': return 'bg-blue-500/10 text-blue-400'
      case 'Blocked': return 'bg-red-500/10 text-red-400'
      default: return 'bg-neutral-800 text-neutral-400'
    }
  }

  const statCards = [
    {
      title: "Total Billed (Fees)",
      value: formatCurrency(totalFees, currency, exchangeRate),
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: `/invoices?client=${client._id}`
    },
    {
      title: "Total Credited (Budget)",
      value: formatCurrency(totalIncome, currency, exchangeRate),
      icon: Wallet,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      link: `/clients/${client._id}/transactions?filter=credited`
    },
    {
      title: "Outstanding Balance",
      value: formatCurrency(totalIncome - totalExpenses, currency, exchangeRate),
      icon: Briefcase,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Total Work Hours",
      value: workLogs.reduce((sum, log) => sum + (log.hoursWorked || 0), 0) + ' hrs',
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      link: `/dashboard/daily-update/${client._id}`
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses, currency, exchangeRate),
      icon: Wallet,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      link: `/clients/${client._id}/transactions?filter=expenses`
    },
    {
      title: "Ad Spend",
      value: formatCurrency(totalAdSpend, currency, exchangeRate),
      icon: Megaphone,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      link: `/clients/${client._id}/transactions?filter=adspend`
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{client.name}</h1>
          <div className="flex items-center gap-4 text-sm text-neutral-400">
            <span>{client.contactPerson || 'No Contact Person'}</span>
            {client.email && <span>• {client.email}</span>}
            {client.phone && <span>• {client.phone}</span>}
          </div>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
            client.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-400'
          }`}>
            {client.status} Client
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon

          const CardContent = (
            <div className={`bg-neutral-900 border border-neutral-800 p-6 rounded-xl ${stat.link ? 'hover:bg-neutral-800/80 transition-colors cursor-pointer group' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor} ${stat.color} ${stat.link ? 'group-hover:scale-110 transition-transform' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          )

          if (stat.link) {
             return <Link href={stat.link} key={i} className="block">{CardContent}</Link>
          }
          return <React.Fragment key={i}>{CardContent}</React.Fragment>
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Invoices */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
             <h2 className="text-lg font-bold text-white">Recent Invoices</h2>
             <Link href="/invoices/create" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Create New</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950/50 text-neutral-400 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">No invoices generated yet.</td>
                  </tr>
                ) : (
                  invoices.slice(0, 5).map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        <Link href={`/invoices/${invoice._id}`} className="hover:text-blue-400 transition-colors">
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{format(new Date(invoice.date), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4 font-bold text-white">{formatCurrency(invoice.amount, currency, exchangeRate)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block capitalize ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {invoices.length > 5 && (
             <div className="p-4 border-t border-neutral-800 text-center">
                <Link href="/invoices" className="text-sm text-neutral-400 hover:text-white transition-colors">View All Invoices</Link>
             </div>
          )}
        </div>

        {/* Work Logs */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
             <h2 className="text-lg font-bold text-white">Daily Work Reports</h2>
             <Link href="/dashboard/daily-update" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View All Logs</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950/50 text-neutral-400 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Task</th>
                  <th className="px-6 py-4">Hours</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {workLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">No work reports logged yet.</td>
                  </tr>
                ) : (
                  workLogs.slice(0, 5).map((log) => (
                    <tr key={log._id} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                          {log.date ? format(new Date(log.date), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{log.employeeName}</td>
                      <td className="px-6 py-4 max-w-[200px] truncate" title={log.taskSummary}>
                          {log.taskSummary}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                          {log.hoursWorked}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block capitalize ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {allTransactions && allTransactions.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col mt-8">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
             <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
             <Link href={`/clients/${client._id}/transactions`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950/50 text-neutral-400 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {paginatedTx.map((tx) => (
                  <tr key={tx._id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{tx.date ? format(new Date(tx.date), 'MMM d, yyyy') : '-'}</td>
                    <td className="px-6 py-4 font-medium text-white">
                      <Link href={`/transaction/${tx._id}`} className="hover:text-blue-400 transition-colors">
                        {tx.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block capitalize ${
                        tx.type === 'income' ? 'bg-green-500/10 text-green-400' :
                        tx.type === 'expense' ? 'bg-red-500/10 text-red-400' :
                        tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{tx.category}</td>
                    <td className="px-6 py-4 text-right font-bold text-white">
                      {formatCurrency(tx.amount || 0, currency, exchangeRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalTxPages > 1 && (
            <div className="p-4 border-t border-neutral-800 flex justify-between items-center">
              <p className="text-sm text-neutral-400">
                Showing {((txPage - 1) * TX_PER_PAGE) + 1}–{Math.min(txPage * TX_PER_PAGE, allTransactions.length)} of {allTransactions.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTxPage(p => Math.max(1, p - 1))}
                  disabled={txPage === 1}
                  className="px-4 py-2 border border-neutral-700 rounded-lg text-sm font-medium bg-neutral-950 disabled:opacity-40 hover:bg-neutral-800 transition-colors text-white"
                >
                  Previous
                </button>
                <button
                  onClick={() => setTxPage(p => Math.min(totalTxPages, p + 1))}
                  disabled={txPage === totalTxPages}
                  className="px-4 py-2 border border-neutral-700 rounded-lg text-sm font-medium bg-neutral-950 disabled:opacity-40 hover:bg-neutral-800 transition-colors text-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
