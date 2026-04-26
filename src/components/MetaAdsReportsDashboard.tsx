'use client'

import { useState } from "react"
import { Plus, Printer, Trash2, Loader2, Pencil } from "lucide-react"
import { MetaAdsReport } from "@/types"
import { DeleteModal } from "@/components/DeleteModal"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { deleteMetaAdsReport } from "@/app/actions"
import Link from "next/link"

export function MetaAdsReportsDashboard({ reports: initialReports }: { reports: MetaAdsReport[] }) {
  const [reports, setReports] = useState(initialReports)
  const [reportToDelete, setReportToDelete] = useState<MetaAdsReport | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return
    setDeletingId(reportToDelete._id)
    const result = await deleteMetaAdsReport(reportToDelete._id)
    if (result.success) {
      toast.success('Report deleted')
      setReports(reports.filter(r => r._id !== reportToDelete._id))
    } else {
      toast.error(result.error || 'Failed to delete report')
    }
    setDeletingId(null)
    setReportToDelete(null)
  }

  const handlePrint = (id: string) => {
    window.open(`/meta-ads-reports/${id}/print`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link
          href="/meta-ads-reports/create"
          className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Report
        </Link>
      </div>

      {reportToDelete && (
        <DeleteModal
          title="Delete Report"
          description={`Are you sure you want to delete this report? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setReportToDelete(null)}
          loading={deletingId === reportToDelete._id}
        />
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/50 text-neutral-400 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Ad Account</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    No reports found. Create your first report to get started.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{report.companyName}</td>
                    <td className="px-6 py-4">{report.adAccountName}</td>
                    <td className="px-6 py-4 text-neutral-400">
                      {format(new Date(report.periodStart), 'd MMM yyyy')} - {format(new Date(report.periodEnd), 'd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      {format(new Date(report.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link
                        href={`/meta-ads-reports/${report._id}/edit`}
                        className="p-2 text-neutral-400 hover:text-white transition-colors bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center"
                        title="Edit Report"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handlePrint(report._id)}
                        className="p-2 text-neutral-400 hover:text-white transition-colors bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center"
                        title="Download PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setReportToDelete(report)}
                        disabled={deletingId === report._id}
                        className="p-2 text-neutral-400 hover:text-red-400 transition-colors bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center rounded-lg"
                        title="Delete Report"
                      >
                        {deletingId === report._id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
