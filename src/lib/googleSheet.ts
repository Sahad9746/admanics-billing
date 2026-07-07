import { google } from 'googleapis'

function getAuthClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!clientEmail || !privateKey) {
    throw new Error('Google Sheets credentials are not fully configured.')
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function appendRows(rows: any[][], targetSheetId?: string, range: string = 'Sheet1!A:G') {
  try {
    const sheetId = targetSheetId || process.env.SHEET_ID
    if (!sheetId) throw new Error('No Spreadsheet ID was provided.')

    const auth = getAuthClient()
    const sheets = google.sheets({ version: 'v4', auth })

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error appending to Google Sheets:', error)
    throw error
  }
}

export async function updateSheetValues(rows: any[][], range: string, targetSheetId?: string) {
  try {
    const sheetId = targetSheetId || process.env.SHEET_ID
    if (!sheetId) throw new Error('No Spreadsheet ID was provided.')

    const auth = getAuthClient()
    const sheets = google.sheets({ version: 'v4', auth })

    // First, clear existing data in the sheet range below headers to prevent leftover rows
    const tabName = range.split('!')[0]
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `${tabName}!A2:Z1000`,
    })

    // If we have rows to write, write them
    if (rows.length > 0) {
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: rows,
        },
      })
      return response.data
    }
  } catch (error) {
    console.error('Error updating Google Sheets:', error)
    throw error
  }
}

