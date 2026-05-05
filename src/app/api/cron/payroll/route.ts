import { NextResponse } from "next/server"
import { client } from "@/lib/sanity"

export async function GET(request: Request) {
  // Verify cron secret for security (provided automatically by Vercel)
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // 1. Calculate previous month string (e.g. "April 2026")
    // Because this runs on the 4th of a month, we are processing the previous month's salary
    const now = new Date()
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const monthYear = prevMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    
    // 2. Fetch all active employees
    const employees = await client.fetch(`*[_type == "employeeProfile" && status == 'active']`)
    if (!employees || employees.length === 0) {
      return NextResponse.json({ message: "No active employees found" })
    }

    // 3. Fetch all pending advances
    const pendingAdvances = await client.fetch(`*[_type == "advancePayment" && status == 'pending']{
      _id,
      amount,
      date,
      "employee": employee->{_id}
    }`)

    const pMonth = prevMonthDate.getMonth()
    const pYear = prevMonthDate.getFullYear()

    let processedCount = 0

    // 4. Process each employee
    for (const emp of employees) {
      // Pre-flight check: ensure no duplicate records for this month
      const existing = await client.fetch(`*[_type == "salaryRecord" && employee._ref == $empId && monthYear == $month][0]`, {
        empId: emp._id,
        month: monthYear
      })
      
      if (existing) {
        console.log(`Payroll already processed for ${emp.name} in ${monthYear}`)
        continue // Skip if already manually processed
      }

      const empAdvances = pendingAdvances.filter((a: any) => a.employee?._id === emp._id)
      let advancesToPay = 0
      let totalDeductions = 0
      const advanceIdsToDeduct: string[] = []

      empAdvances.forEach((a: any) => {
        const aDate = new Date(a.date)
        if (aDate.getMonth() === pMonth && aDate.getFullYear() === pYear) {
          advancesToPay += (a.amount || 0)
        } else if (aDate < prevMonthDate) {
          totalDeductions += (a.amount || 0)
          advanceIdsToDeduct.push(a._id)
        }
      })

      const netSalary = (emp.baseSalary || 0) + advancesToPay - totalDeductions

      // Create Salary Record
      await client.create({
        _type: 'salaryRecord',
        employee: { _type: 'reference', _ref: emp._id },
        monthYear,
        baseSalary: emp.baseSalary || 0,
        bonus: 0,
        totalDeductions: totalDeductions,
        netSalary: netSalary,
        status: 'paid', // Mark as paid for the auto-generation
        advanceDeductions: advanceIdsToDeduct.map((id: string) => ({
          _type: 'reference',
          _ref: id
        }))
      })

      // Mark Advances as Deducted
      if (advanceIdsToDeduct.length > 0) {
        for (const advanceId of advanceIdsToDeduct) {
          await client.patch(advanceId).set({
            status: 'deducted',
            deductedInMonth: monthYear
          }).commit()
        }
      }
      
      processedCount++
      console.log(`Successfully auto-generated payroll for ${emp.name} (${monthYear})`)
    }

    return NextResponse.json({ success: true, message: `Payroll generation completed for ${monthYear}. Processed ${processedCount} employees.` })
  } catch (error: any) {
    console.error("Cron payroll error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
