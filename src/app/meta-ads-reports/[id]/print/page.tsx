import { client } from "@/lib/sanity"
import { MetaAdsReport } from "@/types"
import { notFound } from "next/navigation"
import { PrintableMetaAdsReport } from "@/components/PrintableMetaAdsReport"

export const dynamic = 'force-dynamic'

async function getReport(id: string): Promise<MetaAdsReport | null> {
  const query = `*[_type == "metaAdsReport" && _id == $id][0]`
  try {
    const data = await client.fetch(query, { id })
    return data
  } catch (error) {
    console.error("Sanity fetch error:", error)
    return null
  }
}

export default async function PrintReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await getReport(id)

  if (!report) {
    notFound()
  }

  return (
    <div className="bg-white min-h-screen text-black">
      <PrintableMetaAdsReport report={report} />
    </div>
  )
}
