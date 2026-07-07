import { NextResponse } from 'next/server'
import { getUnsyncedLogs, markLogsSynced } from '@/lib/sanityWorkLog'
import { appendRows } from '@/lib/googleSheet'

export async function GET() {
  try {
    const logs = await getUnsyncedLogs()

    if (!logs || logs.length === 0) {
      return NextResponse.json({ success: true, message: 'No unsynced logs found.' })
    }

    // Group logs by target sheet ID
    const fallbackSheetId = process.env.SHEET_ID
    const logsBySheet: Record<string, typeof logs> = {}

    logs.forEach(log => {
      // Use client-specific sheet ID, or fallback to the global one
      const sheetId = log.client?.googleSheetId || fallbackSheetId
      if (sheetId) {
        if (!logsBySheet[sheetId]) logsBySheet[sheetId] = []
        logsBySheet[sheetId].push(log)
      }
    })

    if (Object.keys(logsBySheet).length === 0) {
      return NextResponse.json({ success: false, message: 'No valid Google Sheet IDs found for these logs.' })
    }

    let totalSynced = 0
    let successIds: string[] = []

    // Process each sheet individually
    for (const [sheetId, sheetLogs] of Object.entries(logsBySheet)) {
      try {
        // Format rows matching: A Date, B Employee, C Project, D Task, E Hours, F Status, G Notes
        const rows = sheetLogs.map(log => [
          new Date(log.date).toISOString().split('T')[0],
          log.employeeName,
          log.project,
          log.taskSummary,
          log.hoursWorked ? log.hoursWorked.toString() : '',
          log.status,
          log.notes || ''
        ])

        // Append to specific sheet
        await appendRows(rows, sheetId, 'Work Logs!A:G')
        
        totalSynced += sheetLogs.length
        successIds.push(...sheetLogs.map(l => l._id))
      } catch (err) {
        console.error(`Failed to sync to sheet ${sheetId}`, err)
        // If one sheet fails, we log the error but let the loop continue to try other sheets
      }
    }

    // Mark successfully synced logs in Sanity
    if (successIds.length > 0) {
      await markLogsSynced(successIds)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${totalSynced} logs.`,
      syncedLogsCount: totalSynced,
      totalLogsAttempted: logs.length
    })

  } catch (error: any) {
    console.error('Cron sync error:', error)
    return NextResponse.json({ error: error.message || 'Failed to sync logs' }, { status: 500 })
  }
}

// In case vercel triggers it via POST depending on their cron setup (though they typically trigger via GET)
export async function POST() {
  return GET();
}
